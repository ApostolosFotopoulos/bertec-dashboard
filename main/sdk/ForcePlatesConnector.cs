using System;
using System.IO;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using Newtonsoft.Json.Linq;

/**
* Compile: 
*   mcs -r:.\BertecDeviceNET.dll .\ForcePlatesConnector.cs
* Execute:
*   .\ForcePlatesConnector.exe <frequency>
*
* Communication Server:
*   [TCP Server (C#)] <----> [TCP Client (JS)] 
*   Description: The frontend communicates with the server to handle different commands related
*   to the force plates (resets, writing trial data to file). Also the server transfers to the frontend 
*   the data from the force plates.
* Events: { name: "-EVENT-", value: "-VALUE-"}
* 
*/

enum Channel{
  FX,
  FY,
  FZ,
  MX,
  MY,
  MZ
};

class CommunicationServer {

  int port = 54221;

  int DATA_BYTES_LENGTH = 10000;

  public Socket client = null;

  public bool isWritingTrialToFile = false;

  public string filePath = "";



  public void setup(BertecDeviceNET.BertecDevice handler){

    /** Establish the local endpoint for the socket */
    IPEndPoint localEndPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), this.port);

    /** Create a TCP/IP socket */
    Socket listener = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

    /** Start a thread to communicate with the clients */
    new Thread(() => { 
      try{

        /** Bind the socket to the local endpoint */
        listener.Bind(localEndPoint);
        Console.WriteLine("[LOG] Communication server is ready.");
        listener.Listen(10);
        
        while (true) {
          this.client = listener.Accept();
          byte[] bytes = new Byte[this.DATA_BYTES_LENGTH];
          string command = null;

          /** An incoming connection needs to be processed.  */
          int bytesRec = this.client.Receive(bytes);
          command = Encoding.ASCII.GetString(bytes, 0, bytesRec);

          Console.WriteLine("[LOG] Command : {0}.", command);

          /** Force Plates Reset Flow */
          var commandJSON = JObject.Parse(command);
          
          if( (string)commandJSON["name"] == "RESET_FORCE_PLATES"){
             if(handler != null){
              Console.WriteLine("[LOG] Zeroing load.");
              handler.ZeroNow();
              while (handler.AutoZeroState != BertecDeviceNET.AutoZeroStates.ZEROFOUND){
                System.Threading.Thread.Sleep(100);
              }
            }
          }

          /** Start Writing To File Flow */
          if( (string)commandJSON["name"]== "START_WRITING_TRIAL_TO_FILE"){
            Console.WriteLine("[LOG] Start writing the trial to file.");
            this.filePath = (string)commandJSON["value"];
            File.WriteAllText(this.filePath, "\ufeffTimestamp;Fx1;Fy1;Fz1;Mx1;My1;Mz1;Fx2;Fy2;Fz2;Mx2;My2;Mz2;Copx1;Copy1;Copxy1;Copx2;Copy2;Copxy2\n");
            this.isWritingTrialToFile = true;
          }

          /** Stop Writing To File Flow */
          if( (string)commandJSON["name"] == "STOP_WRITING_TRIAL_TO_FILE") {
            Console.WriteLine("[LOG] Stop writing the trial to file.");
            this.isWritingTrialToFile = false;
          }

        }

      } catch(Exception e){
        Console.WriteLine(e.ToString());
        return;
      }
    }).Start();
  }
}


class ForcePlatesCallback {

  Configuration configs = null;
  CommunicationServer server = null;
  public BertecDeviceNET.BertecDevice handler = null;
  public int samplingFrequency = 0;
  public int timestampStepping = 0;
  int collectedRows = 0;

  public ForcePlatesCallback(int samplingFrequency, CommunicationServer server, Configuration configs){
    this.samplingFrequency = samplingFrequency;
    this.server = server;
    this.configs = configs;
  }

  public void onDataReceived(BertecDeviceNET.DataFrame[] dataFrames) {
    if(dataFrames.Length == 1) {
      BertecDeviceNET.DataFrame forcePlateOne = dataFrames[0];
      string d = "";

      int channelCount = forcePlateOne.forceData.Length;
      if(channelCount > 0){

        // Fx1	Fy1	Fz1	Mx1	My1	Mz1	
        for (int col = 0; col < channelCount; col++){
          d = d + forcePlateOne.forceData[col].ToString()+";";
        }

        //Fx2	Fy2	Fz2	Mx2	My2	Mz2	
        d = d + "0;0;0;0;0;0;";

        // Copx1
        Double copx1 = 1000*Convert.ToDouble(forcePlateOne.forceData[(int)Channel.MY]/forcePlateOne.forceData[(int)Channel.FZ]);
        d = d + copx1.ToString()+";";
        
        // Copy1
        Double copy1 = 1000*Convert.ToDouble(forcePlateOne.forceData[(int)Channel.MX]/forcePlateOne.forceData[(int)Channel.FZ]);
        d = d + copy1.ToString()+";";
        
        // Copxy1
        d = d + (Math.Sqrt( Math.Pow(copx1,2)+ Math.Pow(copy1,2))).ToString()+";";
        
        // Copx2 Copy2 Copxy2
        d = d + "0;0;0";

        d = d.Replace(",",".");

        // Write the raw data
        if(this.server.isWritingTrialToFile){
          File.AppendAllLines(this.server.filePath, new []{ forcePlateOne.timestamp / 8.0 + ";" + d });
        }

        // Write to TCP buffer
        if(collectedRows == this.configs.samplingFrequency){
          collectedRows = 0;

          String forcePlateSerials = $"{{name: 'FORCE_PLATE_SERIALS', value: {{ left: {this.handler.DeviceSerialNumber(0).ToString()}, right: -1 }}}}";
          this.server.client.Send(Encoding.ASCII.GetBytes(forcePlateSerials));

          String data = $"{{name: 'FORCE_PLATES_DATA', value: {{d}}}}";
          this.server.client.Send(Encoding.ASCII.GetBytes(data));
        }
        collectedRows += 1;
      }
    }

    if(dataFrames.Length == 2) {
      BertecDeviceNET.DataFrame forcePlateOne = dataFrames[0];
      BertecDeviceNET.DataFrame forcePlateTwo = dataFrames[1];
      string d = "";

      int channelCountFirst = forcePlateOne.forceData.Length;
      if(channelCountFirst > 0){
        // Fx1	Fy1	Fz1	Mx1	My1	Mz1	
        for (int col = 0; col < channelCountFirst; col++){
          //Console.Write("{0};", Math.Abs(forcePlateOne.forceData[col]));
          d = d + forcePlateOne.forceData[col].ToString()+";";
        }
      }

      int channelCountSec = forcePlateTwo.forceData.Length;
      if(channelCountSec > 0){
        // Fx2	Fy2	Fz2	Mx2	My2	Mz2	
        for (int col = 0; col < channelCountSec; col++){
          //Console.Write("{0};", Math.Abs(forcePlateTwo.forceData[col]));
          d = d + forcePlateTwo.forceData[col].ToString()+";";
        }
      }

      // Copx1
      Double copx1 = 1000*Convert.ToDouble(forcePlateOne.forceData[(int)Channel.MY]/forcePlateOne.forceData[(int)Channel.FZ]);
      d = d + copx1.ToString()+";";
      
      // Copy1
      Double copy1 = 1000*Convert.ToDouble(forcePlateOne.forceData[(int)Channel.MX]/forcePlateOne.forceData[(int)Channel.FZ]);
      d = d + copy1.ToString()+";";
      
      // Copxy1
      d = d + (Math.Sqrt( Math.Pow(copx1,2)+ Math.Pow(copy1,2))).ToString()+";";
      
      // Copx2
      Double copx2 = 1000*Convert.ToDouble(forcePlateTwo.forceData[(int)Channel.MY]/forcePlateTwo.forceData[(int)Channel.FZ]);
      d = d + copx2.ToString()+";";
      
      // Copy2
      Double copy2 = 1000*Convert.ToDouble(forcePlateTwo.forceData[(int)Channel.MX]/forcePlateTwo.forceData[(int)Channel.FZ]);
      d = d + copy2.ToString()+";";
      
      // Copxy2
      d = d + (Math.Sqrt( Math.Pow(copx2,2)+ Math.Pow(copy2,2))).ToString();

      d = d.Replace(",",".");

      // Write the raw data
      if(this.server.isWritingTrialToFile){
        File.AppendAllLines(this.server.filePath, new []{ forcePlateOne.timestamp / 8.0 + ";" + d });
      }

      // Write to TCP buffer
      if(collectedRows == this.configs.samplingFrequency){
        collectedRows = 0;

        String forcePlateSerials = $"{{name: 'FORCE_PLATE_SERIALS', value: {{ left: {this.handler.DeviceSerialNumber(0).ToString()}, right: {this.handler.DeviceSerialNumber(1).ToString()}}}}}";
        this.server.client.Send(Encoding.ASCII.GetBytes(forcePlateSerials));
        
        String data = $"{{name: 'FORCE_PLATES_DATA', value: {{d}}}}";
        this.server.client.Send(Encoding.ASCII.GetBytes(data));
      }
      collectedRows += 1;
    }
  }

  public void statusEvent(BertecDeviceNET.StatusErrors status) {
    Console.WriteLine("[LOG] Status: {0}.", status);
  }

}

/** Class that has all the configurations for the force plate communication */
class Configuration {
  public int samplingFrequency = 10;
  public void setup(string[] args) {
    switch (args.Length) {
      case 1:
        this.samplingFrequency = Int32.Parse(args[0]);
        break;
      default:
        break;
    }
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

     /** Setup the communication server that handles the commands from the client and the data transfer */
    CommunicationServer server = new CommunicationServer();
    server.setup(handler);

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

      /** Clear the buffered data */
      handler.ClearBufferedData();

      /** Initialize the callback for the bertec force plates handler */
      ForcePlatesCallback callback = new ForcePlatesCallback(configs.samplingFrequency, server,configs);

      /** After the connection link the connection handler wtih callback handler */
      callback.handler = handler;

      /* Setup the callback for the data streaming */
      handler.OnData += callback.onDataReceived;
      handler.OnStatus += callback.statusEvent;

    }).Start();

    return;
  }
}