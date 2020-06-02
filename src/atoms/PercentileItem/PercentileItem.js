import React from 'react';

export default function PercentileItem({percentileName, values}) {
  return (
    <>
    <div>
        <h2>{percentileName}</h2>
        <div>
            {values.map(item => <div key={item.value}>{`${item.name} -> ${item.value}`}</div>)}
        </div>
    </div>
    </>
  );
}
