package main

import (
	"fmt"
	"log"
	"net"
	"time"
)

const (
	INIT          = 0
	PEERSET       = 1
	PEERHANDSHAKE = 2
	PEERRECV      = 3
	DYING         = 4

	MTU = 2048
)

type Multiplexer struct {
	Conn *net.UDPConn // 占用的port
}

func (m *Multiplexer) Remove(i interface{}) {

}

type Portal struct {
	LocalAddr string
	Conn      *net.UDPConn // 占用的port
	Peer      *net.UDPAddr // 远端地址
	Local     *net.UDPAddr // server端：server；client端口：nil
	// for mux
	AddrFromMux *net.Addr // AddrFrom is the default
	Mux         *Multiplexer
	// timestamp
	timeStampLastPack int64
	Timeout           int64
	//
	status int

	SendLocal func(p *Portal) []byte
}

func NewPortal(ptype string) (p *Portal) {
	c, _ := net.ListenUDP(ptype, nil)

	if ptype == `udp6` {
		return nil
	} else {
		s, err := GetAddr(c)
		if err != nil {
			log.Println(err)
		}
		fmt.Println(s)

		p = &Portal{
			LocalAddr: s,
			Conn:      c,
			Timeout:   2,
		}
		go p.Start()
	}
	return p
}

func (p *Portal) Set(paddr *string, laddr *string, mux *Multiplexer) {
	if paddr != nil {
		peer, err := net.ResolveUDPAddr(`udp`, *paddr)
		if err != nil {
			p.Peer = peer
		} else {
			log.Println(err)
		}
	}
	if laddr != nil {
		local, err := net.ResolveUDPAddr(`udp`, *laddr)
		if err != nil {
			p.Local = local
		} else {
			log.Println(err)
		}
	}
	if mux != nil {
		p.Mux = mux
	}
}

// condition: set peer, so it can heart beat with it
func (p *Portal) Start() {
	dummy, _ := net.ResolveUDPAddr("udp", "114.114.114.114:53")
	for p.Peer == nil {
		time.Sleep(time.Second)
		p.Conn.WriteTo([]byte{}, dummy)
	}
	dummy = nil

	log.Println(`peer : `, p.Peer)
	p.timeStampLastPack = time.Now().Unix()
	p.status = PEERSET

	go func() { // heart beat with peer
		for p.status != DYING {
			if p.status == PEERSET {
				p.Conn.WriteTo([]byte{}, p.Peer) // send empty packet
			}
			// another task
			if p.timeStampLastPack+p.Timeout < time.Now().Unix() {
				p.Stop()
			}
			// sleep
			time.Sleep(time.Second)
		}
	}()
	// 好饿。
	// and listen //
	for p.status != DYING {
		buffer := make([]byte, MTU)
		l, addr, err := (*p.Conn).ReadFrom(buffer)
		if err != nil {
			log.Println(err.Error())
			continue
		}
		// fmt.Println(addr.String())
		// fmt.Println(p.Peer.String())
		if p.status == PEERSET {
			p.timeStampLastPack = time.Now().Unix() // renew the timestamp when last pkt received
			p.status = PEERHANDSHAKE
		}
		if l == 0 {
			continue
		}
		if p.status == PEERHANDSHAKE {
			p.status = PEERRECV
		}

		fmt.Println(`recv from `, addr, ` l=`, l)
		if addr.String() == (*p.Peer).String() { // if the pkt is from peer
			p.RecvPacketFromPeer(l, buffer)
		} else { // the pkt is from others (not peer)
			p.RecvPacketFromOthers(l, buffer)
		}

	}
}

// client receive: forward to mux, mux send to local port
// server receive: forward to server:port (*p.local)
func (p *Portal) RecvPacketFromPeer(l int, buf []byte) {
	if p.Local != nil { // if have Local then send to Local
		p.Conn.WriteTo(buf[:l], p.Local)
	} else if p.Mux != nil { // else send to Mux to handle it
		p.Mux.Conn.WriteTo(buf[:l], p.Local) //
	} // drop when all empty
}

// client receive: forward to peer (*p.peer) directly use this function (but which is not import)
// server receive: forward to peer (*p.peer) it's from server:port (but which is not import)
func (p *Portal) RecvPacketFromOthers(l int, buf []byte) {
	if p.Peer != nil { // don't ask, just send to peer
		p.Conn.WriteTo(buf, p.Peer)
	}
} // done

func (p *Portal) Stop() {
	if p.Mux != nil {
		p.Mux.Remove(p.Local.String())
	}
	err := p.Conn.Close()
	if err != nil {
		log.Println(err)
	}
	p.status = DYING
}