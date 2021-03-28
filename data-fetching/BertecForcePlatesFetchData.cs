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

    public void onDataCallback(BertecDeviceNET.DataFrame[] dataFrames){
      if (dataFrames.Length > 0){
        BertecDeviceNET.DataFrame devData = dataFrames[0]; // for multiple devices you would iterate through the device array.
        int channelCount = devData.forceData.Length;
        
        if (channelCount > 0){
          string d = "";
  
          Console.Write(",{0},{1}", devData.syncData, devData.auxData);
          d = d + ((double)devData.timestamp / 8.0);
          d = d + ", " + devData.syncData + ", "+ devData.auxData;
          for (int col = 0; col < channelCount; ++col){
            d = d + ", " + devData.forceData[col];
            Console.Write(",{0}", devData.forceData[col]);
          }
          d = d +"\r\n";
          Console.Write("\r\n");
        }
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
      bool isTesting = true;

      // Create the dataframe to save the data
      BertecDeviceNET.DataFrame[] dataFrames = new BertecDeviceNET.DataFrame[0];

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
      int port = 12345;
      TcpClient client = new TcpClient("localhost",port);
      NetworkStream stream = client.GetStream();
      StreamWriter writer = new StreamWriter(stream) { AutoFlush = true };
      Console.WriteLine("TCP Connection successfully established...");

      
      //--------------------------------------- ONLY FOR TEST PURPOSE -------------------------------

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

      // After the connection link the connection handler wtih callback handler
      callback.handler = handler;

      // Start the handler
      handler.Start();

      // Inform about the devices that are connected
      for (int i = 0; i < handler.DeviceCount; ++i){
        Console.WriteLine("Plate {0} connected",handler.DeviceSerialNumber(i));
      }

      // Clear the buffered data
      handler.ClearBufferedData();

      // Setup the callback for the data streaming
      handler.OnData += callback.onDataCallback;
      handler.OnStatus += callback.statusEvent;
      handler.OnDeviceTimestamp += callback.deviceTimestamp;
      callback.timestampStepping = timestampStepping;

      // Read the data and call the callback to print them
      while(true){
        while (handler.BufferedDataAvailable > 0){
          handler.ReadBufferedData(ref dataFrames);
          //callback.onDataCallback(dataFrames); 

          if (dataFrames.Length > 1){
           // When there are two force plates
           
          } else if(dataFrames.Length > 0){

            // When there is only one force plate
            BertecDeviceNET.DataFrame devData = dataFrames[0]; // for multiple devices you would iterate through the device array.
            int channelCount = devData.forceData.Length;
            
            if (channelCount > 0){
              string d = "";

              // Fx1	Fy1	Fz1	Mx1	My1	Mz1	Fx2	Fy2	Fz2	Mx2	My2	Mz2
              for (int col = 0; col < channelCount; ++col){
                d = d + devData.forceData[col]+",";
                Console.Write(",{0}", Math.Abs(devData.forceData[col]));
              }
              
              // Copx1
              d = d + (devData.forceData[(int)Channel.MY1]/devData.forceData[(int)Channel.FZ1]).ToString()+",";
              // Copy1
              d = d + (devData.forceData[(int)Channel.MX1]/devData.forceData[(int)Channel.FZ1]).ToString()+",";
              // Copxy1
              d = d + (Math.Sqrt( Math.Pow(devData.forceData[(int)Channel.MY1]/devData.forceData[(int)Channel.FZ1],2)+ Math.Pow(devData.forceData[(int)Channel.MX1]/devData.forceData[(int)Channel.FZ1],2))).ToString()+",";

              // Copx2
              d = d + (devData.forceData[(int)Channel.MY2]/devData.forceData[(int)Channel.FZ2]).ToString()+",";
              // Copy2
              d = d + (devData.forceData[(int)Channel.MX2]/devData.forceData[(int)Channel.FZ2]).ToString()+",";
              // Copxy2
              d = d + (Math.Sqrt( Math.Pow(devData.forceData[(int)Channel.MY2]/devData.forceData[(int)Channel.FZ2],2) + Math.Pow(devData.forceData[(int)Channel.MX2]/devData.forceData[(int)Channel.FZ2],2))).ToString();

              d = d +"\r\n";

              // Here goes the code for TCP echo
              writer.WriteLine(d);
            }
          }
        }
        System.Threading.Thread.Sleep(100);
      }

      // Stop the connection handler and finish the data fetching
      //handler.Stop();
      //handler.Dispose();
      //handler = null;
    }
  }
}