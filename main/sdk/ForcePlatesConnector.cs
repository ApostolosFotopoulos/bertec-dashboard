using System;
using System.IO;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Net.Sockets;
using System.Threading;


/**
* Compile: 
*   mcs -r:.\BertecDeviceNET.dll .\ForcePlatesConnector.cs
* Execute:
*   .\ForcePlatesConnector.exe <frequency>
*
* Communication Server:
*   [TCP Server] <----> [TCP Client] 
*   Description: The frontend communicates with the server to handle different commands related
*   to the force plates (resets, writing trial data to file)
* DataStream Client:
*   [TCP Client] <----> [TCP Server]
*   Description: The force plate connector sends the data that are provided from the force plates
*   to the frontend to visualize them
*
*/


/** Class that has all the configurations for the force plate communication */
class Configuration {

  public int samplingFrequency = 10;

  public void setup(string[] args){
    switch (args.Length) {
      case 1:
        this.samplingFrequency = Int32.Parse(args[0]);
        break;
      default:
        break;
    }
  }
}


class CommunicationServer {

  string hostname = "localhost";
  int port = 54221;
  int DATA_BYTE_LENGTH = 10000;
  

  public void setup(BertecDeviceNET.BertecDevice handler){

    // Establish the local endpoint for the socket
    IPHostEntry ipHostInfo = Dns.GetHostEntry(this.hostname);
    IPAddress ipAddress = ipHostInfo.AddressList[0];
    IPEndPoint localEndPoint = new IPEndPoint(ipAddress, this.port);

    // Create a TCP/IP socket
    Socket listener = new Socket(ipAddress.AddressFamily, SocketType.Stream, ProtocolType.Tcp);

    // Start a thread to communicate with the clients
    new Thread(() => { 
      try{

        // Bind the socket to the local endpoin
        listener.Bind(localEndPoint);
        Console.WriteLine("[LOG] Communication server is ready.");
        listener.Listen(10);
        
        while (true) {
          Socket socketHandler = listener.Accept();
          byte[] bytes = new Byte[this.DATA_BYTE_LENGTH];
          string command = null;

          // An incoming connection needs to be processed.  
          int bytesRec = socketHandler.Receive(bytes);
          command = Encoding.ASCII.GetString(bytes, 0, bytesRec);

          Console.WriteLine("[LOG] Command : {0}.", command);
          this.commandHandler(command,handler);
        }

      } catch(Exception e){
        Console.WriteLine(e.ToString());
      }
    }).Start();
  }

  void commandHandler(string command, BertecDeviceNET.BertecDevice handler){
    switch(command){
      case "RESET_FORCE_PLATES":
        if(handler != null){
          Console.WriteLine("[LOG] Zeroing load.");
          handler.ZeroNow();
          while (handler.AutoZeroState != BertecDeviceNET.AutoZeroStates.ZEROFOUND){
            System.Threading.Thread.Sleep(100);
          }
        }
        break;
      default:
        break;
    }
  }
}

class DataStreamingClient {
  string hostname = "localhost";
  int port = 54221;

  public void setup(BertecDeviceNET.BertecDevice handler){
    Console.WriteLine("[LOG] Data stream client is ready.");
  }
}

class ForcePlatesCallback {

  DataStreamingClient client = null;
  public BertecDeviceNET.BertecDevice handler = null;
  public int samplingFrequency = 0;
  public int timestampStepping = 0;

  public ForcePlatesCallback(int samplingFrequency, DataStreamingClient client){
    this.samplingFrequency = samplingFrequency;
    this.client = client;
  }

  public void onDataCallback(BertecDeviceNET.DataFrame[] dataFrames) { 

  }

  public void statusEvent(BertecDeviceNET.StatusErrors status) {
    Console.WriteLine("[LOG] Status: {0}.", status);
  }

}

class ForcePlatesConnector {
  static void Main(string[] args) {

    /** Setup the configuration from the command arguments */
    Configuration configs = new Configuration();
    configs.setup(args);

    /** Create the handler for the connection */
    BertecDeviceNET.BertecDevice handler;
    try {
      handler = new BertecDeviceNET.BertecDevice();
    }
    catch {
      Console.WriteLine("[LOG] Unable to initialize the Bertec Device Library (possible missing FTD2XX install).");
      return;
    }

    new Thread(() => {

      /** Start the handler */
      handler.AutoZeroing = true;
      handler.Start();

      /** Wait for the devices to connect  */
      Console.WriteLine("[LOG] Waiting for devices.");

      /** When a device or more are connected then continue the process */
      while (handler.Status != BertecDeviceNET.StatusErrors.DEVICES_READY) {
        System.Threading.Thread.Sleep(100);
        if (handler.DeviceCount > 0) {
          break;
        }
      }

      /** Zeroing the load  */
      Console.WriteLine("[LOG] Zeroing load.");
      handler.ZeroNow();
      while (handler.AutoZeroState != BertecDeviceNET.AutoZeroStates.ZEROFOUND){
        System.Threading.Thread.Sleep(100);
      }

      /** Create the data stream client for the data transfer */
      DataStreamingClient client = new DataStreamingClient();
      client.setup(handler);

      /** Clear the buffered data */
      handler.ClearBufferedData();

      /** Initialize the callback for the bertec force plates handler */
      ForcePlatesCallback callback = new ForcePlatesCallback(configs.samplingFrequency, client);

      /** After the connection link the connection handler wtih callback handler */
      callback.handler = handler;

      /* Setup the callback for the data streaming */
      handler.OnData += callback.onDataCallback;
      handler.OnStatus += callback.statusEvent;

    }).Start();

    /** Setup the communication server that sends data and waits for requests from the client */
    CommunicationServer server = new CommunicationServer();
    server.setup(handler);

    return;
  }
}