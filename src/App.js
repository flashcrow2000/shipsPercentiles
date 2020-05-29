import React, { useEffect, useState } from "react";

import "./App.css";
import { getShips } from "./api/api";
import {
  loadShips,
  selectShipsList,
  loadShipsInformation,
  selectShipInformation,
} from "./features/ships/shipsSlice";
import { useDispatch, useSelector } from "react-redux";
import { percentile } from "./utils/utils";
// import { PortList } from "./molecules/PortList/PortList";

function App() {
  const dispatch = useDispatch();
  const ships = useSelector(selectShipsList);
  const shipInformation = useSelector(selectShipInformation);
  const [shipsListLength, setShipsListLength] = useState(0);
  const [portInfo, setPortInfo] = useState([]);
  // nth percentile: https://www.youtube.com/watch?v=MSQpvuPL2cw; https://www.manageengine.com/network-monitoring/faq/95th-percentile-calculation.html
  const [portCallDurationList, setPortCallDurationList] = useState([]);
  useEffect(() => {
    dispatch(loadShips());
  }, []);

  useEffect(() => {
    if (ships.length && shipsListLength !== ships.length) {
      setShipsListLength(ships.length);
      dispatch(loadShipsInformation(ships));
    }
  }, [ships]);

  useEffect(() => {
    if (shipInformation.length === ships.length) {
      const portsMap = [];
      let sortedPorts = [];
      let portcallDurations = [];
      // create a map of all port names and vessels
      shipInformation.forEach((vesselInfo) => {
        vesselInfo.portCalls.forEach((portCall) => {
          if (!portCall.isOmitted) {
            portcallDurations.push(
              Math.abs(
                new Date(portCall.departure) - new Date(portCall.arrival)
              ) / 1000
            );
            if (!portsMap[portCall.port.name]) {
              portsMap[portCall.port.name] = [];
            }
            portsMap[portCall.port.name].push(vesselInfo.vessel.name);
          }
        });
      });
      // transform the above map into a new data structure which has portName and list of vessels
      for (let portName in portsMap) {
        sortedPorts.push({ portName, vessels: portsMap[portName] });
      }
      // sort the list of ports depending on the number of vessels
      sortedPorts = sortedPorts.sort((a, b) => {
        if (a.vessels.length > b.vessels.length) {
          return 1;
        } else {
          return -1;
        }
      });
      portcallDurations = portcallDurations.sort((a, b) => a - b);
      setPortCallDurationList(portcallDurations);

      // console.log(percentile(5));
      // console.log(percentile(20));
      // console.log(percentile(90));
      // console.log(portcallDurations);
      setPortInfo(sortedPorts);
      console.log('sortedPorts', sortedPorts.slice(sortedPorts.length - 5).reverse());
      console.log('sortedPorts', sortedPorts.slice(0, 5));
      // port call percentiles for 2, 7, 14 days
      const portCallDelayMap = [];
      shipInformation.forEach((vesselInfo) => {
        portCallDelayMap[vesselInfo.vessel.name] = [];
        vesselInfo.portCalls.forEach((portCall) => {
          if (portCall.isOmitted) {
            return;
          }
          let found2dayLog = false;
          let found7dayLog = false;
          let found14dayLog = false;
          const secondsInADay = 24 * 3600;
          portCall.logEntries.forEach((logEntry) => {
            if (
              logEntry.updatedField !== "arrival" ||
              logEntry.isOmitted ||
              found14dayLog
            ) {
              return;
            }
            if (
              Math.abs(
                new Date(logEntry.createdDate) - new Date(portCall.arrival)
              ) /
                1000 >
                2 * secondsInADay &&
              !found2dayLog
            ) {
              found2dayLog = true;
              portCallDelayMap[vesselInfo.vessel.name].push(
                Math.abs(
                  new Date(logEntry.arrival) - new Date(portCall.arrival)
                ) /
                  1000 /
                  3600
              );
            }
            if (
              Math.abs(
                new Date(logEntry.createdDate) - new Date(portCall.arrival)
              ) /
                1000 >
                7 * secondsInADay &&
              !found7dayLog
            ) {
              found7dayLog = true;
              portCallDelayMap[vesselInfo.vessel.name].push(
                Math.abs(
                  new Date(logEntry.arrival) - new Date(portCall.arrival)
                ) /
                  1000 /
                  3600
              );
            }
            if (
              Math.abs(
                new Date(logEntry.createdDate) - new Date(portCall.arrival)
              ) /
                1000 >
                14 * secondsInADay &&
              !found14dayLog
            ) {
              found14dayLog = true;
              portCallDelayMap[vesselInfo.vessel.name].push(
                Math.abs(
                  new Date(logEntry.arrival) - new Date(portCall.arrival)
                ) /
                  1000 /
                  3600
              );
            }
          });
        });
        portCallDelayMap[vesselInfo.vessel.name] = portCallDelayMap[
          vesselInfo.vessel.name
        ].sort((a, b) => a - b);
      });
      console.log(portCallDelayMap);
      for (let vesselName in portCallDelayMap) {
        console.log(
          `${vesselName} percentiles: 5th -> ${percentile(
            5,
            portCallDelayMap[vesselName]
          )}; 50th -> ${percentile(
            50,
            portCallDelayMap[vesselName]
          )}; 80th -> ${percentile(80, portCallDelayMap[vesselName])}`
        );
      }
    }
  }, [shipInformation]);

  useEffect(() => {}, [shipInformation]);
  return <div className="App">{/* <PortList portInfo={portInfo} /> */}</div>;
}

export default App;
