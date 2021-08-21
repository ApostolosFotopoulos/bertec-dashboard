using System;
using System.IO;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Net.Sockets;
using System.Threading;


class CommunicationServer
{

  string hostname = "localhost";
  int port = 5422;
  int DATA_BYTES_LENGTH = 10000;
  public Socket socketHandler = null;


  public void setup()
  {

    /** Establish the local endpoint for the socket */
    IPEndPoint localEndPoint = new IPEndPoint(IPAddress.Parse("127.0.0.1"), this.port);

    /** Create a TCP/IP socket */
    Socket listener = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);

    /** Start a thread to communicate with the clients */
    new Thread(() =>
    {
      try
      {

        /** Bind the socket to the local endpoint */
        listener.Bind(localEndPoint);
        Console.WriteLine("[LOG] Communication server is ready.");
        listener.Listen(10);

        while (true)
        {
          this.socketHandler = listener.Accept();
          byte[] bytes = new Byte[this.DATA_BYTES_LENGTH];
          string command = null;

          /** An incoming connection needs to be processed.  */
          int bytesRec = this.socketHandler.Receive(bytes);
          command = Encoding.ASCII.GetString(bytes, 0, bytesRec);

          Console.WriteLine("[LOG] Command : {0}.", command);
          this.commandHandler(command);
        }

      }
      catch (Exception e)
      {
        Console.WriteLine(e.ToString());
      }
    }).Start();
  }

  void commandHandler(string command)
  {
    switch (command)
    {
      case "RESET_FORCE_PLATES":
        Console.WriteLine("[LOG] Zeroing load.");
        break;
      default:
        break;
    }
  }
}

class ForcePlatesConnector {
  static void Main(string[] args) {
    CommunicationServer server = new CommunicationServer();
    server.setup();

    while(true){
      byte[] byData = System.Text.Encoding.ASCII.GetBytes("HELLO");
      if(server.socketHandler !=null){
        server.socketHandler.Send(byData);
      }
      
      System.Threading.Thread.Sleep(100);
    }
    return;
  }
}