import React from 'react';
import styles from './styles.module.css';

export default function PortListItem({portName, vessels}) {
  return (
    <>
        <div className={styles.container}>
            <div>{portName}</div>
            <div>{`${vessels.length} ${vessels.length === 1 ? 'call' : 'calls'}`}</div>
        </div>
    </>
  );
}
