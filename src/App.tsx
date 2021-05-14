import React from 'react';
import './App.css';
import GoogleMap from './Components/GoogleMap';
import Result from './Components/Result';

function App() {
  const [height, setHeight] = React.useState(300);
  const [mapData, setMapData] = React.useState<any>([]);

  const updateWindowDimensions = () => {
    setHeight(window.innerHeight);
  };

  const _onDrawComplete = (polygon: string) => {
    setMapData([polygon]);
  };

  const _onMapClear = () => setMapData([]);

  React.useEffect(() => {
    window.addEventListener('resize', updateWindowDimensions);

    return () => window.removeEventListener('resize', updateWindowDimensions);
  }, []);

  return (
    <div className="App-container">
      <header className="App-header">
        <div className="page-container feed" style={{ height: height }}>
          <div className="search-result-container">
            <div className="map-container">
              <GoogleMap onComplete={_onDrawComplete} onClear={_onMapClear} />
            </div>

            <div style={{ height: '100%', maxWidth: 720, width: '100%' }}>
              <Result data={mapData} />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
