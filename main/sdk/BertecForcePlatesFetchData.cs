using System;
using System.IO;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Net.Sockets;
using System.Threading;

namespace BertecForcePlatesFetchData{
  enum Channel{
    FX,
    FY,
    FZ,
    MX,
    MY,
    MZ
  };

  class CallbackHandler{
    public BertecDeviceNET.BertecDevice handler = null;
    public int timestampStepping = 0;
    private Int64 timestampValue = 0;

    // Data streaming
    public TcpClient client;
    public NetworkStream stream;
    public StreamWriter writer;
    public int dataCollected = 0;
    public int counter = 0;
      

    public void createTCPClientForDataStreaming(){
      int port = 12345;
      this.client = new TcpClient("localhost",port);
      Byte[] bytes = new Byte[1024];
      this.stream = this.client.GetStream();
      new Thread(() => {
        while(true){
         // Get a stream object for reading 				
          using (this.stream) { 					
            int length; 					
            // Read incomming stream into byte arrary. 					
            while ((length = stream.Read(bytes, 0, bytes.Length)) != 0) { 						
              var incommingData = new byte[length]; 						
              Array.Copy(bytes, 0, incommingData, 0, length); 						
              // Convert byte array to string message. 						
              string serverMessage = Encoding.ASCII.GetString(incommingData);					
              Console.WriteLine("SERVER MESSAGE RECEIVED : " + serverMessage);

              if(serverMessage == "RESET_FORCE_PLATES"){
                Console.Write("\nZeroing Load...");
                handler.ZeroNow();
                while (handler.AutoZeroState != BertecDeviceNET.AutoZeroStates.ZEROFOUND){
                  Console.Write(".");
                  System.Threading.Thread.Sleep(100);
                }
                Console.WriteLine("\nDone");
              }
            } 				
          } 	 
        }
      }).Start();
      this.writer = new StreamWriter(this.stream);
      Console.WriteLine("TCP Client is configured for data streaming...");
    }

    public void onDataCallback(BertecDeviceNET.DataFrame[] dataFrames){ 
      // Only one force plate is connected
      if(dataFrames.Length == 1){
        BertecDeviceNET.DataFrame firstForcePlate = dataFrames[0];
        string d = "";

        int channelCount = firstForcePlate.forceData.Length;
        if(channelCount > 0){

          // Fx1	Fy1	Fz1	Mx1	My1	Mz1	
          for (int col = 0; col < channelCount; ++col){
            d = d + firstForcePlate.forceData[col].ToString()+";";
          }

          //Fx2	Fy2	Fz2	Mx2	My2	Mz2	
          d = d + "0;0;0;0;0;0;";

          // Copx1
          Double copx1 = 1000*Convert.ToDouble(firstForcePlate.forceData[(int)Channel.MY]/firstForcePlate.forceData[(int)Channel.FZ]);
          d = d + copx1.ToString()+";";
          
          // Copy1
          Double copy1 = 1000*Convert.ToDouble(firstForcePlate.forceData[(int)Channel.MX]/firstForcePlate.forceData[(int)Channel.FZ]);
          d = d + copy1.ToString()+";";
          
          // Copxy1
          d = d + (Math.Sqrt( Math.Pow(copx1,2)+ Math.Pow(copy1,2))).ToString()+";";
          
          // Copx2 Copy2 Copxy2
          d = d + "0;0;0\r\n";

          // Write to TCP buffe
          if(dataCollected == 10){
            dataCollected = 0;

            writer.Flush();
            String forcePlates = "LEFT_PLATE;"+handler.DeviceSerialNumber(0).ToString()+";RIGHT_PLATE;-1;";
            writer.WriteLine(forcePlates);
            writer.Flush();

            writer.Flush();
            writer.WriteLine(d);
            writer.Flush();
            //Console.WriteLine(Math.Abs(firstForcePlate.forceData[2]).ToString());
            //Console.WriteLine(counter);
            //Console.WriteLine(copx1.ToString());
            //counter+=1;
          }
          dataCollected += 1;
        }
      }

      // Both force plates are connected
      if(dataFrames.Length == 2){
        BertecDeviceNET.DataFrame firstForcePlate = dataFrames[0];
        BertecDeviceNET.DataFrame secForcePlate = dataFrames[1];
        string d = "";

        int channelCountFirst = firstForcePlate.forceData.Length;
        if(channelCountFirst > 0){
          // Fx1	Fy1	Fz1	Mx1	My1	Mz1	
          for (int col = 0; col < channelCountFirst; ++col){
            //Console.Write("{0};", Math.Abs(firstForcePlate.forceData[col]));
            d = d + firstForcePlate.forceData[col].ToString()+";";
          }
        }

        int channelCountSec = secForcePlate.forceData.Length;
        if(channelCountSec > 0){
          // Fx2	Fy2	Fz2	Mx2	My2	Mz2	
          for (int col = 0; col < channelCountSec; ++col){
            //Console.Write("{0};", Math.Abs(secForcePlate.forceData[col]));
            d = d + secForcePlate.forceData[col].ToString()+";";
          }
        }

        // Copx1
        Double copx1 = 1000*Convert.ToDouble(firstForcePlate.forceData[(int)Channel.MY]/firstForcePlate.forceData[(int)Channel.FZ]);
        d = d + copx1.ToString()+";";
        
        // Copy1
        Double copy1 = 1000*Convert.ToDouble(firstForcePlate.forceData[(int)Channel.MX]/firstForcePlate.forceData[(int)Channel.FZ]);
        d = d + copy1.ToString()+";";
        
        // Copxy1
        d = d + (Math.Sqrt( Math.Pow(copx1,2)+ Math.Pow(copy1,2))).ToString()+";";
        
        // Copx2
        Double copx2 = 1000*Convert.ToDouble(secForcePlate.forceData[(int)Channel.MY]/secForcePlate.forceData[(int)Channel.FZ]);
        d = d + copx2.ToString()+";";
        
        // Copy2
        Double copy2 = 1000*Convert.ToDouble(secForcePlate.forceData[(int)Channel.MX]/secForcePlate.forceData[(int)Channel.FZ]);
        d = d + copy2.ToString()+";";
        
        // Copxy2
        d = d + (Math.Sqrt( Math.Pow(copx2,2)+ Math.Pow(copy2,2))).ToString()+";";

        if(dataCollected == 10){
          dataCollected = 0;

          writer.Flush();
          String forcePlates = "LEFT_PLATE;"+handler.DeviceSerialNumber(0).ToString()+";RIGHT_PLATE;"+handler.DeviceSerialNumber(1).ToString()+";";;
          writer.WriteLine(forcePlates);
          writer.Flush();

          writer.Flush();
          writer.WriteLine(d);
          writer.Flush();
          //Console.WriteLine(Math.Abs(firstForcePlate.forceData[2]).ToString());
          //Console.WriteLine(counter);
          //Console.WriteLine(copx1.ToString());
          //counter+=1;
        }
        dataCollected += 1;
      }
    }
    public void statusEvent(BertecDeviceNET.StatusErrors status){
      Console.WriteLine("Status event {0}", status);
    }
    public Int64 deviceTimestamp(int deviceNum){
      timestampValue += timestampStepping;
      return timestampValue;
    }

  }
  class BertecForcePlatesFetchData{
    static void Main(string[] args){
      int timestampStepping = 0;
      //bool isTesting = true;

      // Create the callback handler that triggers when data arrives
      CallbackHandler callback = new CallbackHandler();
      
      // Create the handler for the connection
      BertecDeviceNET.BertecDevice handler;
      try{
        handler = new BertecDeviceNET.BertecDevice();
      } catch(System.Exception e){
        Console.WriteLine("Unable to initialize the Bertec Device Library (possible missing FTD2XX install).");
        Console.WriteLine(e);
        return;
      }
      
       // After the connection link the connection handler wtih callback handler
      callback.handler = handler;

      // Start the handler
      handler.AutoZeroing = true;
      handler.Start();

      // Wait for the devices to connect 
      Console.Write("Waiting for devices..");

      // When a device or more are connected then continue the process
      while(handler.Status != BertecDeviceNET.StatusErrors.DEVICES_READY){
        Console.Write(".");
        System.Threading.Thread.Sleep(100);
        if(handler.DeviceCount > 0){
          break;
        }
      }

      // Zeroing the load 
      Console.Write("Zeroing Load...");
      handler.ZeroNow();
      while (handler.AutoZeroState != BertecDeviceNET.AutoZeroStates.ZEROFOUND){
        Console.Write(".");
        System.Threading.Thread.Sleep(100);
      }
      Console.WriteLine("\nDone");

      
      // Create the TCP Client
      callback.createTCPClientForDataStreaming();


      // Clear the buffered data
      handler.ClearBufferedData();


      // Setup the callback for the data streaming
      handler.OnData += callback.onDataCallback;
      handler.OnStatus += callback.statusEvent;
      handler.OnDeviceTimestamp += callback.deviceTimestamp;
      callback.timestampStepping = timestampStepping;
  

      // Wait until the session is stopped
      while(true);
    }
  }
}