const events = require('events')
var net = require('net')

class TCPListener {
  constructor(p,i){
    this.port = p || 12345
    this.ip = i || "0.0.0.0"
  }
  listen(){
    this.eventEmitter = new events.EventEmitter()

    this.server = new net.Server()
    this.server.listen(this.port,()=>{
      console.log("TCPListener is active....")
    })

    this.server.on("connection",(socket)=>{
      socket.on("data",(chunk)=>{
        console.log(`Data received from the socket: ${chunk.toString()}.`)
      })
    })
    return this.eventEmitter
  }
  destroy(){
    if(this.server){
      delete this.server
    }
    if(this.eventEmitter){
      delete this.eventEmitter
    }
  }
}
module.exports = TCPListener