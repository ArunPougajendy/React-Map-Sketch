import React from 'react';
import ReactJson from 'react-json-view';

function Result(props: any) {
  return (
    <div style={styles.container}>
      <h2>Result</h2>
      <div>
        <ReactJson
          theme="pop"
          style={styles.jsonViewerStyle}
          collapsed
          collapseStringsAfterLength={900}
          groupArraysAfterLength={1}
          src={props.data}
        />
      </div>
    </div>
  );
}
export default Result;

const styles = {
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    overFlow: 'scroll',
  },
  jsonViewerStyle: {
    color: 'white',
    overflow: 'scroll',
    fontSize: 14,
    maxHeight: 500,
  },
};
