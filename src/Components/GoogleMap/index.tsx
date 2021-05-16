import * as React from 'react';
import GoogleMapReact from 'google-map-react';
import config from '../../services/config';
import Button from '@material-ui/core/Button';
import './styles.css';
const CENTER = {
  lat: 12.9476578,
  lng: 77.5961341,
};

interface Props {
  center: { lat: number; lng: number };
  onClear: Function;
  onComplete: Function;
  zoom: number;
}
interface State {
  isDrawable: boolean;
  mapCleared: boolean;
  mapReady: boolean;
  polygonCoordinates: string;
}

class GoogleMap extends React.Component<Props, State> {
  static defaultProps = {
    center: { ...CENTER },
    zoom: 14,
  };

  mapView: any;
  polygonControllers: any;

  constructor(props: Props) {
    super(props);
    this.state = {
      isDrawable: false,
      mapCleared: false,
      mapReady: false,
      polygonCoordinates: '',
    };
  }

  _onMapLoaded = () => {
    if (!this.state.mapReady) {
      this.setState({
        mapReady: true,
      });
    }
  };

  _drawFreeHand = () => {
    const poly = new this.mapView.maps_.Polyline({
      clickable: false,
      map: this.mapView.map_,
      strokeColor: '#42A5F5',
      strokeWeight: 3,
    });
    // Added mousemove listener to track the user's mouse movement
    const move = this.mapView.maps_.event.addListener(
      this.mapView.map_,
      'mousemove',
      (e: any) => {
        poly.getPath().push(e.latLng);
      },
    );

    // Added mouseup listener to check when the user releases the mouse button
    this.mapView.maps_.event.addListenerOnce(
      this.mapView.map_,
      'mouseup',
      (e: any) => {
        this.mapView.maps_.event.removeListener(move);
        const path = poly.getPath();
        poly.setMap(null);
        const polygon = new this.mapView.maps_.Polygon({
          clickable: false,
          fillColor: '#42A5F5',
          fillOpacity: 0.25,
          geodesic: true,
          map: this.mapView.map_,
          path,
          strokeColor: '#42A5F5',
          strokeWeight: 3,
        });
        this._polyComplete(polygon);
        this.mapView.maps_.event.clearListeners(
          this.mapView.googleMapDom_,
          'mousedown',
        );
      },
    );
  };

  // Helper method to get the coordinates across the polygon line
  _polyComplete = (poly: any) => {
    this.polygonControllers = poly;
    let bounds = '';
    const paths = poly.getPaths();
    paths.forEach((path: any) => {
      const ar = path.getArray();
      for (let i = 0, l = ar.length; i < l; i++) {
        const lat = ar[i].lat();
        const lng = ar[i].lng();
        bounds += `${lng} ${lat},`;
      }
      // Appending the first coords as last to make a complete polygon
      if (ar[0]) {
        bounds += `${ar[0].lng()} ${ar[0].lat()}`;
      }
    });
    this.setState({
      polygonCoordinates: bounds,
    });
  };

  _enableDrawableHelper = () => {
    // Clear the old Listeners if exits and attach a new 'mousedown' listener on Map
    if (this.mapView) {
      this.mapView.maps_.event.clearListeners(
        this.mapView.googleMapDom_,
        'mousedown',
      );
      this.mapView.maps_.event.addDomListener(
        this.mapView.googleMapDom_,
        'mousedown',
        this._drawFreeHand,
      );
    }
  };
  _handleDrawEvent = () => {
    // Invoked when User clicks DRAW button
    this._enableDrawableHelper();
  };

  _handleDrawable = () => {
    this.setState(
      {
        isDrawable: !this.state.isDrawable,
      },
      () => {
        if (this.state.isDrawable) {
          this._handleResetDrawEvent();
          this._handleDrawEvent();
        } else {
          this.props.onComplete(this.state.polygonCoordinates);
        }
      },
    );
  };

  _handleResetDrawEvent = () => {
    this.setState({
      mapCleared: false,
      polygonCoordinates: '',
    });

    this.props.onClear();
    if (this.polygonControllers) {
      this.polygonControllers.setMap(null);
    }
    this.mapView.maps_.event.addDomListener(
      this.mapView.googleMapDom_,
      'mousedown',
      this._drawFreeHand,
    );
  };
  _handleClearMap = () => {
    this.setState(
      {
        mapCleared: true,
        polygonCoordinates: '',
      },
      () => {
        this.props.onClear();
        if (this.polygonControllers) {
          this.polygonControllers.setMap(null);
        }
      },
    );
  };

  _handleCancelDrawable = () => {
    this.setState(
      {
        isDrawable: false,
      },
      () => {
        this._handleClearMap();
      },
    );
  };

  render() {
    return (
      <div style={{ height: '100%', width: '100%' }}>
        {this.state.mapReady && (
          <React.Fragment>
            {!this.state.isDrawable && (
              <div className={'draw-button-container'}>
                {this.state.polygonCoordinates !== '' && (
                  <Button
                    variant="contained"
                    size="small"
                    className="clear-button"
                    onClick={this._handleClearMap}
                    style={{ margin: '0 5px' }}
                  >
                    CLEAR
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="small"
                  className="draw-on-map-button"
                  onClick={this._handleDrawable}
                  style={{ margin: '0 5px' }}
                  disabled={
                    this.state.isDrawable &&
                    this.state.polygonCoordinates === '' &&
                    true
                  }
                >
                  DRAW ON MAP
                </Button>
              </div>
            )}
            {this.state.isDrawable && (
              <React.Fragment>
                <div className="button-container no-mobile">
                  <div style={{ paddingLeft: 25 }}>
                    <p>Draw a shape to search a specific area</p>
                  </div>
                  <div>
                    <Button
                      style={{ padding: 0 }}
                      onClick={() => {
                        if (this.state.polygonCoordinates === '') {
                          this._handleCancelDrawable();
                        } else {
                          this._handleResetDrawEvent();
                        }
                      }}
                    >
                      <div className="map-buttons">
                        {this.state.polygonCoordinates === ''
                          ? 'CANCEL'
                          : 'RESET'}
                      </div>
                    </Button>
                    <Button
                      style={{ padding: 0 }}
                      onClick={this._handleDrawable}
                      disabled={
                        this.state.isDrawable &&
                        this.state.polygonCoordinates === '' &&
                        true
                      }
                    >
                      <div className="map-buttons">APPLY</div>
                    </Button>
                  </div>
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        )}
        <GoogleMapReact
          ref={(ref: any) => (this.mapView = ref)}
          bootstrapURLKeys={{
            key: config.googleMaps.apiKey,
            libraries: config.googleMaps.libraries,
          }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          onTilesLoaded={this._onMapLoaded}
          draggable={!this.state.isDrawable}
          options={{
            clickableIcons: false,
            controlSize: 30,
            disableDoubleClickZoom: true,
            fullscreenControl: false,
            gestureHandling: 'greedy',
            keyboardShortcuts: false,
            panControl: false,
            scrollwheel: true,
            zoomControl: true,
          }}
          shouldUnregisterMapOnUnmount
          yesIWantToUseGoogleMapApiInternals
        />
      </div>
    );
  }
}
export default GoogleMap;
