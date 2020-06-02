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
import PortList from "./molecules/PortList/PortList";
import PercentileItem from "./atoms/PercentileItem/PercentileItem";
import VesselsPercentiles from "./molecules/VesselsPercentiles/VesselsPercentiles";
// import { PortList } from "./molecules/PortList/PortList";

function App() {
  const dispatch = useDispatch();
  const ships = useSelector(selectShipsList);
  const shipInformation = useSelector(selectShipInformation);
  const [shipsListLength, setShipsListLength] = useState(0);
  const [portInfo, setPortInfo] = useState([]);
  const [portCallsPercentiles, setPortCallsPercentiles] = useState([]);
  const [vesselsPortCallDelayPercentiles, setVesselsPortCallDelayPercentiles] = useState([]);
  // nth percentile: https://www.youtube.com/watch?v=MSQpvuPL2cw; https://www.manageengine.com/network-monitoring/faq/95th-percentile-calculation.html
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
              ) / 1000 / 3600
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
      console.log(portcallDurations);
      const percentilesList = portcallDurations.length && [
        {
          name: "5th",
          value: `${percentile(5, portcallDurations)} hrs`
        },
        {
          name: "20th",
          value: `${percentile(20, portcallDurations)} hrs`
        },
        {
          name: "50th",
          value: `${percentile(50, portcallDurations)} hrs`
        },
        {
          name: "75th",
          value: `${percentile(75, portcallDurations)} hrs`
        },
        {
          name: "90th",
          value: `${percentile(90, portcallDurations)} hrs`
        }
      ]
      setPortCallsPercentiles(percentilesList)

      setPortInfo(sortedPorts);

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
      const vesselsPercentiles = []
      for (let vesselName in portCallDelayMap) {
        vesselsPercentiles.push({
          vessel: vesselName,
          percentiles: [
            {
              name: "5th",
              value: `${percentile(5, portCallDelayMap[vesselName])} hrs`
            },
            {
              name: "50th",
              value: `${percentile(50, portCallDelayMap[vesselName])} hrs`
            },
            {
              name: "80th",
              value: `${percentile(80, portCallDelayMap[vesselName])} hrs`
            },
          ]
        })
      }
      setVesselsPortCallDelayPercentiles(vesselsPercentiles)
    }
  }, [shipInformation]);

  useEffect(() => {}, [shipInformation]);
  return (
  <div className="App">
    {portInfo.length && <PortList sortedPorts={portInfo} />}
    {portCallsPercentiles.length && <PercentileItem percentileName={"Port calls percentiles:"} values={portCallsPercentiles} />}
    {vesselsPortCallDelayPercentiles.length && <VesselsPercentiles vessels={vesselsPortCallDelayPercentiles} />}
  </div>
  );
}

export default App;
