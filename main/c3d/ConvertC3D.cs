using System;
using System.IO;
using C3D;
using System.Globalization;

/**
* Compile: 
*   mcs -r:.\C3D.dll  .\ConvertC3D.cs
* Execute:
*   .\ConvertC3D.exe <trial> <out>
* Github for the library: https://github.com/mayswind/C3D.NET
*/

namespace ConvertC3D {
  class ConvertC3D  {
    static void Main(string[] args){

      string csvPath = "";
      string outPath = "";
      
      // Validate the number of argument and also setup the variables for the execution.
      if(args.Length < 2) {
        Console.WriteLine("[ERROR] Wrong number of arguments. Ex. ./Convert3D <trial> <out>");
        return;
      }
      csvPath = "" + args[0];
      outPath = "" + args[1];

      C3DFile file = C3DFile.Create();

      // Setup the number of analog channels.
      file.Parameters.SetParameter<UInt16>("ANALOG", "USED", 12);

      // Setup the labels for the analog channels.
      String[] analogLabels = { "Fx1", "Fy1", "Fz1", "Mx1", "My1", "Mz1","Fx2", "Fy2","Fz2","Mx2","My2","Mz2" };
      file.Parameters.SetParameter<String[]>("ANALOG", "LABELS",analogLabels);

      // Setup the description for the analog channels.
      String[] analogDescriptions = { "Left Foot - Fx", "Left Foot - Fy", "Left Foot - Fz", "Left Foot - Mx", "Left Foot - My", "Left Foot Mz",
        "Right Foot - Fx", "Right Foot - Fy","Right Foot - Fz","Right Foot - Mx","Right Foot - My","Right Foot - Mz" };
      file.Parameters.SetParameter<String[]>("ANALOG", "DESCRIPTIONS", analogDescriptions);

      // Setup the offset for the analog channels.
      UInt16[] analogOffset = { 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
      file.Parameters.SetParameter<UInt16[]>("ANALOG", "OFFSET", analogOffset);

      // Setup the scale for the analog channels.
      Single[] analogScale = { 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f, 1.0f };
      file.Parameters.SetParameter<Single[]>("ANALOG", "SCALE", analogScale);

      // Setup the unit for the analog channels.
      String[] analogUnits = { "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N", "N" };
      file.Parameters.SetParameter<String[]>("ANALOG", "UNITS", analogUnits);

      // Setup the number of force plates used.
      file.Parameters.SetParameter<UInt16>("FORCE_PLATFORM", "USED", 2);

      // Setup the force plates type.
      file.Parameters.SetParameter<UInt16>("FORCE_PLATFORM", "TYPE", 2);

      // Setup the number of value per channel.
      file.Parameters.SetParameter<UInt16>("POINT", "RATE", 1);
      file.Parameters.SetParameter<UInt16>("ANALOG", "RATE", 1);

      // Create the c3d file from csv.
      UInt16 nRows = 0;
      string[] separator = { ";" };
      using (StreamReader sr = new StreamReader(csvPath)){
        string currentLine;
        bool isFirstLine = true;
        while ((currentLine = sr.ReadLine()) != null){
          if(!isFirstLine){
            string[] rowData = currentLine.Split(separator, System.StringSplitOptions.RemoveEmptyEntries);
            if(rowData.Length > 0){
              file.AllFrames.Add(new C3DFrame(
                new C3DPoint3DData[]{
                  new C3DPoint3DData{ X= float.Parse(rowData[1], CultureInfo.InvariantCulture.NumberFormat) , Y= float.Parse(rowData[2], CultureInfo.InvariantCulture.NumberFormat), Z= float.Parse(rowData[3], CultureInfo.InvariantCulture.NumberFormat) , Residual= float.Parse(rowData[4], CultureInfo.InvariantCulture.NumberFormat) },
                  new C3DPoint3DData{ X= float.Parse(rowData[5], CultureInfo.InvariantCulture.NumberFormat) , Y= float.Parse(rowData[6], CultureInfo.InvariantCulture.NumberFormat), Z= float.Parse(rowData[7], CultureInfo.InvariantCulture.NumberFormat) , Residual= float.Parse(rowData[8], CultureInfo.InvariantCulture.NumberFormat) },
                  new C3DPoint3DData{ X= float.Parse(rowData[9], CultureInfo.InvariantCulture.NumberFormat) , Y= float.Parse(rowData[10], CultureInfo.InvariantCulture.NumberFormat), Z= float.Parse(rowData[11], CultureInfo.InvariantCulture.NumberFormat) , Residual= float.Parse(rowData[12], CultureInfo.InvariantCulture.NumberFormat) },
                }
              ));
              nRows += 1;
            }
          }
          isFirstLine = false;
        }
      }

      // Setup the number of frames per channel.
      file.Parameters.SetParameter<UInt16>("POINT", "FRAMES", nRows);

      // Create the c3d file.
      file.SaveTo(outPath);
    }
  }
}