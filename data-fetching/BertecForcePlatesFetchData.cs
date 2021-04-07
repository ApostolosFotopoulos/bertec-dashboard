using System;
using System.IO;
using System.Collections.Generic;
using System.Text;
using System.Net;
using System.Net.Sockets;

namespace BertecForcePlatesFetchData{
  enum Channel{
    FX1,
    FY1,
    FZ1,
    MX1,
    MY1,
    MZ1,
    FX2,
    FY2,
    FZ2,
    MX2,
    MY2,
    MZ2,
    COPX1,
    COPY1,
    COPXY1,
    COPX2,
    COPY2,
    COPXY2
  };

  class CallbackHandler{
    public BertecDeviceNET.BertecDevice handler = null;
    public int timestampStepping = 0;
    private Int64 timestampValue = 0;
    public TcpClient client;
    public NetworkStream stream;
    public StreamWriter writer;
    public int dataCollected = 0;
    public int counter = 0;
      

    public void createTCPClient(){
      int port = 12345;
      this.client = new TcpClient("localhost",port);
      this.stream  = this.client.GetStream();
      this.writer = new StreamWriter(this.stream);
      Console.WriteLine("TCP Client is configured...");
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
          Double copx1 = 1000*Convert.ToDouble(firstForcePlate.forceData[(int)Channel.MY1]/firstForcePlate.forceData[(int)Channel.FZ1]);
          d = d + copx1.ToString()+";";
          
          // Copy1
          Double copy1 = 1000*Convert.ToDouble(firstForcePlate.forceData[(int)Channel.MX1]/firstForcePlate.forceData[(int)Channel.FZ1]);
          d = d + copy1.ToString()+";";
          
          // Copxy1
          d = d + (Math.Sqrt( Math.Pow(firstForcePlate.forceData[(int)Channel.MY1]/firstForcePlate.forceData[(int)Channel.FZ1],2)+ Math.Pow(firstForcePlate.forceData[(int)Channel.MX1]/firstForcePlate.forceData[(int)Channel.FZ1],2))).ToString()+";";
          
          // Copx2 Copy2 Copxy2
          d = d + "0;0;0\r\n";
          //Console.Write(d);

          // Write to TCP buffe
          if(dataCollected == 10){
            dataCollected = 0;
            //Console.Write(d);

            writer.Flush();
            writer.WriteLine(d);
            writer.Flush();
            Console.WriteLine(Math.Abs(firstForcePlate.forceData[2]).ToString());
            Console.WriteLine(counter);
            Console.WriteLine(copx1.ToString());
            counter+=1;
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
            d = d + Math.Abs(firstForcePlate.forceData[col]).ToString()+";";
          }
        }

        int channelCountSec = secForcePlate.forceData.Length;
        if(channelCountSec > 0){
          // Fx2	Fy2	Fz2	Mx2	My2	Mz2	
          for (int col = 0; col < channelCountSec; ++col){
            //Console.Write("{0};", Math.Abs(secForcePlate.forceData[col]));
            d = d + Math.Abs(secForcePlate.forceData[col]).ToString()+";";
          }
        }

        // Copx1
        d = d + (firstForcePlate.forceData[(int)Channel.MY1]/firstForcePlate.forceData[(int)Channel.FZ1]).ToString()+";";
        
        // Copy1
        d = d + (firstForcePlate.forceData[(int)Channel.MX1]/firstForcePlate.forceData[(int)Channel.FZ1]).ToString()+";";
        
        // Copxy1
        d = d + (Math.Sqrt( Math.Pow(firstForcePlate.forceData[(int)Channel.MY1]/firstForcePlate.forceData[(int)Channel.FZ1],2)+ Math.Pow(firstForcePlate.forceData[(int)Channel.MX1]/firstForcePlate.forceData[(int)Channel.FZ1],2))).ToString()+";";

        // Copx2
        d = d + (secForcePlate.forceData[(int)Channel.MY2]/secForcePlate.forceData[(int)Channel.FZ2]).ToString()+";";

        // Copy2
        d = d + (secForcePlate.forceData[(int)Channel.MX2]/secForcePlate.forceData[(int)Channel.FZ2]).ToString()+";";

        // Copxy2
        d = d + (Math.Sqrt( Math.Pow(secForcePlate.forceData[(int)Channel.MY2]/secForcePlate.forceData[(int)Channel.FZ2],2)+ Math.Pow(secForcePlate.forceData[(int)Channel.MX2]/secForcePlate.forceData[(int)Channel.FZ2],2))).ToString()+";";
      
        Console.Write(d);

        // Write to TCP buffer
        writer.Flush();
        writer.WriteLine(d);
        writer.Flush();
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

      // Create the TCP Client
      callback.createTCPClient();

      
      /*//--------------------------------------- ONLY FOR TEST PURPOSE -------------------------------

      // Read all the data
      bool isFirstLine = true;
      List<string> dataArr = new List<string>(); 
      using(var reader = new StreamReader(@"./run_2belts.csv")){
        while (!reader.EndOfStream){
          if(isFirstLine){
            reader.ReadLine();
            isFirstLine = false;
          } else {
            var line = reader.ReadLine();
            dataArr.Add(line);
          }
        }
      }
    
      Console.Write("Started streaming data....");
      int step = 0;
      while(isTesting){
        writer.Flush();
        writer.WriteLine(dataArr[step % dataArr.Count]);
        writer.Flush();
        System.Threading.Thread.Sleep(10);
        step = step + 1;
      }

      //--------------------------------------- ONLY FOR TEST PURPOSE -------------------------------
      */
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

      // Inform about the devices that are connected
      for (int i = 0; i < handler.DeviceCount; ++i){
        Console.WriteLine("\nPlate {0} connected",handler.DeviceSerialNumber(i));
      }

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