using System;
using C3D;

/**
* Compile: 
*   mcs -r:.\C3D.dll  .\ConvertC3D.cs
* Execute:
*   .\ConvertC3D.exe
* Github for the library: https://github.com/mayswind/C3D.NET
*/

namespace ConvertC3D {
  class ConvertC3D  {
    static void Main(string[] args){
      C3DFile file = C3DFile.Create();
      file.Parameters.SetParameter<UInt16>("POINT", "USED", 5);
      Random rnd = new Random();
      file.AllFrames.Add(new C3DFrame(new C3DPoint3DData[] {
        new C3DPoint3DData() { X = rnd.Next(1, 100), Y = rnd.Next(1, 100), Z = rnd.Next(1, 100) },
        new C3DPoint3DData() { X = rnd.Next(1, 100), Y = rnd.Next(1, 100), Z = rnd.Next(1, 100) },
        new C3DPoint3DData() { X = rnd.Next(1, 100), Y = rnd.Next(1, 100), Z = rnd.Next(1, 100) },
        new C3DPoint3DData() { X = rnd.Next(1, 100), Y = rnd.Next(1, 100), Z = rnd.Next(1, 100) },
        new C3DPoint3DData() { X = rnd.Next(1, 100), Y = rnd.Next(1, 100), Z = rnd.Next(1, 100) },
      }));
      file.SaveTo("test.c3d");
    }
  }
}