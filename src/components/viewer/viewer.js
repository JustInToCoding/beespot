/* eslint-disable import/first */
import React, { PureComponent, createRef } from "react";

import "./viewer.css";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import {
  Map,
  TileLayer,
  LayersControl,
  MapProps,
  WMSTileLayer,
  LayerGroup
} from "react-leaflet";
import L from "leaflet";
window.L = L;
import "leaflet-draw";
import produce from "immer";
import { MapSelector } from "../map-selector/map-selector";
import { TimeRange } from "../time-range/time-range";
import { Graph } from "../graph/graph";

const { BaseLayer, Overlay } = LayersControl;

const defaultMapParams = {
  tileSize: 256,
  attribution: "Bird'sAI",
  maxZoom: 14,
  noWrap: true
};

const defaultMap = {
  isPublic: true,
  name: "Select map",
  timestamps: [],
  uuid: "",
  wmsName: "Chaco"
};

class Viewer extends PureComponent {
  mapRef = createRef();

  state = {
    zoom: 10,
    hasLocation: false,
    lat: 51.8426069,
    lon: 5.8380148,
    timestampNumber: "0",
    map: defaultMap,
    layer: "image",
    selected: null,
    showSideBar: false
  };

  componentDidMount() {
    const map = this.mapRef.current.leafletElement;
    var drawnItems = new L.featureGroup();
    map.addLayer(drawnItems);
    var drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          allowIntersection: false
        },
        rectangle: true,
        marker: false,
        polyline: false,
        circle: false,
        circlemarker: false
      },
      edit: false
    });
    map.addControl(drawControl);
    map.on(L.Draw.Event.CREATED, this.onShapeDrawnClosure(drawnItems));
  }

  onShapeDrawnClosure(drawnItems) {
    return function onShapeDrawn(event) {
      drawnItems.clearLayers();
      const layer = event.layer;
      drawnItems.addLayer(layer);
      const latLngs = layer.getLatLngs()[0];
      const map = this.mapRef.current.leafletElement;

      map.panTo(layer.getCenter());
      this.setState(
        produce(this.state, draft => {
          draft.selected = latLngs;
        })
      );
      this.fetchData();
      this.setState(
        produce(this.state, draft => {
          draft.showSideBar = true;
        })
      );
    }.bind(this);
  }

  async fetchData() {
    const latLngs = this.state.selected;
    if (latLngs) {
      const requests = this.state.map.timestamps.map(async timestamp => {
        const tileData = await this.getTileData(latLngs, timestamp.uuid);
        return {
          timestamp,
          tileData
        };
      });

      const result = await Promise.all(requests);
      debugger;
      return result;
    }
  }

  async getTileData(latLngs, uuid) {
    const shape = latLngs.map(latLng => ({ x: latLng.lng, y: latLng.lat }));

    const formBody = {
      timestampUuid: this.state.map.timestamps[0].uuid,
      shape: shape,
      getIndices: true
    };

    const response = await fetch("https://api.birdsai.co/api/gettiledata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: JSON.stringify(formBody),
      credentials: "include"
    });

    const json = await response.json();

    return json;
  }

  // getBounds() {
  //   const leaflet = this.mapRef.current;
  //   const bounds = leaflet ? leaflet.leafletElement.getBounds() : undefined;
  //   return bounds;
  // }

  // getCrs() {
  //   const leaflet = this.mapRef.current;
  //   const crs = leaflet ? leaflet.leafletElement.options.crs : undefined;
  //   return crs;
  // }

  handleZoomEnd = () => {};

  handleDragEnd = () => {};

  handleClick = () => {};

  // Call this after map has leafletElement exists to find current location: this.mapRef.current.leafletElement.locate();
  handleLocationFound = () => {
    //this.props.onLocationFound(e.latlng);
  };

  handleFeatureClick = () => {};

  selectMap = map => {
    this.setState(
      produce(this.state, draft => {
        if (map) {
          draft.map = map;
        } else {
          draft.map = defaultMap;
        }
      })
    );
  };

  render() {
    // @ts-ignore
    const position = [this.state.lat, this.state.lon];

    return (
      <div className="map">
        {this.state.showSideBar ? (
          <div className="sidebar">
            <Graph />
          </div>
        ) : (
          undefined
        )}

        <div className="map-selector">
          <MapSelector onSelect={this.selectMap} />
        </div>
        <div className="time-range-selector">
          <TimeRange />
        </div>
        <Map
          center={position}
          zoom={this.state.zoom}
          onZoomEnd={this.handleZoomEnd}
          onDragEnd={this.handleDragEnd}
          style={{ height: "100vh" }}
          onClick={this.handleClick}
          onLocationfound={this.handleLocationFound}
          ref={this.mapRef}
        >
          <LayersControl position="topright">
            <BaseLayer checked name="OpenStreetMap">
              <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </BaseLayer>
            <Overlay checked name="Images">
              <WMSTileLayer
                url={`https://wms.birdsai.co/${
                  this.state.map.wmsName
                }/wms/{time}/{layer}/{z}/{x}/{y}.png`}
                tileSize={defaultMapParams.tileSize}
                noWrap={defaultMapParams.noWrap}
                maxZoom={defaultMapParams.maxZoom}
                attribution={defaultMapParams.attribution}
                map={this.state.map.wmsName}
                time={this.state.timestampNumber}
                layer="image"
                format="image/png"
              />
            </Overlay>
            <Overlay checked name="Classification">
              <WMSTileLayer
                url={`https://wms.birdsai.co/${
                  this.state.map.wmsName
                }/wms/{time}/{layer}/{z}/{x}/{y}.png`}
                tileSize={defaultMapParams.tileSize}
                noWrap={defaultMapParams.noWrap}
                maxZoom={defaultMapParams.maxZoom}
                attribution={defaultMapParams.attribution}
                map={this.state.map.wmsName}
                time={this.state.timestampNumber}
                layer="label"
                format="image/png"
              />
            </Overlay>
          </LayersControl>
        </Map>
      </div>
    );
  }
}

/*
https://wms.birdsai.co/Netherlands/wms/0/label/8/132/85.png?service=WMS&request=GetMap&layers=&styles=&format=image%2Fjpeg&transparent=false&version=1.1.1&map=Netherlands&layer=label&time=0&width=256&height=256&srs=EPSG%3A3857&bbox=626172.1357121639,6574807.424977722,782715.1696402049,6731350.458905762
*/

export default Viewer;
