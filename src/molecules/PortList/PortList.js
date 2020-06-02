import React from 'react';
import PortListItem from '../../atoms/PortListItem/PortListItem';

export default function PortList({sortedPorts}) {
    console.log(sortedPorts)
  return (
    <>
        <div>
            <div>
                <h2>Best performing ports</h2>
                <div>
                    {sortedPorts.slice(sortedPorts.length - 5).reverse().map(port => {
                    return <PortListItem key={port.portName} portName={port.portName} vessels={port.vessels} /> })
                    }
                </div>
            </div>
            <div>
                <h2>Worst performing ports</h2>
                <div>
                    {sortedPorts.slice(0, 5).map(port => {
                    return <PortListItem key={port.portName} portName={port.portName} vessels={port.vessels} /> })
                    }
                </div>
            </div>
        </div>
    </>
  );
}
