import React from 'react';
import PercentileItem from '../../atoms/PercentileItem/PercentileItem';

export default function VesselsPercentiles({vessels}) {
  return (
    <>
        <div>
            <h2>Delay percentiles per ship</h2>
            <div>
                {vessels.map(item => <PercentileItem key={item.vessel} percentileName={item.vessel} values={item.percentiles} />)}
            </div>
        </div>
    </>
  );
}
