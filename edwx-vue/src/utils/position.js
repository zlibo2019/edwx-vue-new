const Position = {
  initPoint: null,
  drawCircle: function (map, point, radius) {
    let circle = new BMap.Circle(point, radius, {
      enableMassClear: true,
      strokeColor: 'red',
      strokeStyle: 'solid',
      strokeWeight: '10',
    });
    map.addOverlay(circle);
  },
  getMarkerBd: function (container, longitude, latitude, zoom, dragFlag, callback) {
    if (longitude == null || latitude == null) {
      if (callback !== null && typeof callback === 'function') {
        callback(null);
      }
    }
    let that = this;
    let map = new BMap.Map(container);

    let geolocationControl = new BMap.GeolocationControl({
      showAddressBar: false,
    });

    geolocationControl.addEventListener('locationSuccess', (point) => {
      map.clearOverlays();
      that.initPoint = point.point;
      // that.drawCircle(map, point.point, that.radius);
      that.getAddressBd(point.point, map, dragFlag, callback);
    });

    map.addControl(geolocationControl);

    let point = new BMap.Point(longitude, latitude);
    map.centerAndZoom(
      new BMap.Point(116.331398, 39.897445),
      zoom,
    );

    map.panTo(point);
    this.initPoint = point;
    // let geolocation = new BMap.Geolocation();

    // this.drawCircle(map, point, this.radius);
    this.getAddressBd(point, map, dragFlag, callback);
  },

  getAddressBd: function (point, map, dragFlag, callback) {
    let that = this;
    let myGeo = new BMap.Geocoder();
    // 根据坐标得到地址描述
    myGeo.getLocation(point, function (result) {
      let address = '';
      let title = '';
      let info = '';
      let addComp = result.addressComponents;
      let surround = result.surroundingPois;
      if (surround.length > 0) {
        title = surround[0].title;
        address = surround[0].address;
      } else {
        address = addComp.province +
          addComp.city +
          addComp.district +
          addComp.street +
          addComp.streetNumber;
      }
      let markerOptions = {
        raiseOnDrag: true,
      };
      let marker = new BMap.Marker(point, markerOptions); // 创建标注
      if (dragFlag === true) {
        marker.enableDragging();
        marker.addEventListener('dragend', (type) => {
          let offset = map.getDistance(that.initPoint, type.point).toFixed(2);
          if (offset > window.vm.$params.radius) {
            that.getAddressBd(that.initPoint, map, dragFlag, callback);
          } else {
            that.getAddressBd(type.point, map, dragFlag, callback);
          }
        });
      }

      map.clearOverlays();

      if (title !== '') {
        info = title + '（' + address + '）';
      } else {
        info = address;
      }

      let label = new BMap.Label(
        info, {
          offset: new BMap.Size(25, 1),
        },
      );

      label.setStyle({fontSize: '0.15rem'});

      marker.setLabel(label);

      map.addOverlay(marker); // 将标注添加到地图中

      if (callback !== null && typeof callback === 'function') {
        callback(
          {
            address: title !== '' ? title : address,
            longitude: point.lng,
            latitude: point.lat,
          },
        );
      }
    });
  },

  isRange: function (container, longitude, latitude, points) {
    let pointA = new BMap.Point(longitude, latitude);
    for (let i = 0; i < points.length; i++) {
      let pointB = new BMap.Point(
        points[i].longitude,
        points[i].latitude,
      );
      // 创建点坐标B--签到地点
      let map = new BMap.Map(container);
      let lengtha = map.getDistance(pointA, pointB).toFixed(2); //获取两点距离,保留小数点后两位
      if (+lengtha < +points[i].range) {
        return true;
      }
    }
    return false;
  },

  getCity: function (container, longitude, latitude, zoom, dragFlag, callback) {
    if (longitude == null || latitude == null) {
      if (callback !== null && typeof callback === 'function') {
        callback(null);
      }
    }
    let point = new BMap.Point(longitude, latitude);
    // this.initPoint = point;
    let myGeo = new BMap.Geocoder();
    // 根据坐标得到地址描述
    myGeo.getLocation(point, function (result) {
      let city = result.addressComponents.city;
      if (callback !== null && typeof callback === 'function') {
        callback(city);
      }
    });
  },
};

export default Position;

