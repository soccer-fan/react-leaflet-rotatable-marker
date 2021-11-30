/* eslint-disable camelcase */
import L from 'leaflet'

/*
Vanilla (non-react) implementation of a rotatable marker

Largely drawn from https://github.com/bbecquet/Leaflet.RotatedMarker
but changed to provide an extension of the Marker type, rather than updating
the type itself
*/

// save these original methods before they are overwritten
const proto_initIcon = L.Marker.prototype._initIcon
const proto_setPos = L.Marker.prototype._setPos

const oldIE = (L.DomUtil.TRANSFORM === 'msTransform')

export const Marker = L.Marker.extend({

  _initIcon: function () {
    proto_initIcon.call(this)
  },

  _setPos: function (pos) {
    proto_setPos.call(this, pos)
    this._applyRotation()
  },

  _applyRotation: function () {
    if (this.options.rotationAngle) {
      this._icon.style[L.DomUtil.TRANSFORM + 'Origin'] = this.options.rotationOrigin

      if (oldIE) {
        // for IE 9, use the 2D rotation
        this._icon.style[L.DomUtil.TRANSFORM] = 'rotate(' + this.options.rotationAngle + 'deg)'
      } else {
        // for modern browsers, prefer the 3D accelerated version
        this._icon.style[L.DomUtil.TRANSFORM] += ' rotateZ(' + this.options.rotationAngle + 'deg)'
      }
    }
  },

  setRotationAngle: function (angle) {
    this.options.rotationAngle = angle
    this.update()
    return this
  },

  setRotationOrigin: function (origin) {
    this.options.rotationOrigin = origin
    this.update()
    return this
  }
})

Marker.addInitHook(function () {
  const iconOptions = this.options.icon && this.options.icon.options
  let iconAnchor = iconOptions && this.options.icon.options.iconAnchor
  if (iconAnchor) {
    iconAnchor = (iconAnchor[0] + 'px ' + iconAnchor[1] + 'px')
  }
  this.options.rotationOrigin = this.options.rotationOrigin || iconAnchor || 'center'
  this.options.rotationAngle = this.options.rotationAngle || 0

  // Ensure marker keeps rotated during dragging
  this.on('drag', function (e) { e.target._applyRotation() })
})

// // @factory L.wrappedPolyline(latlngs: LatLng[], options?: Polyline options)
// // Instantiates a polyline that will automatically split around the
// // antimeridian (Internation Date Line) if that is a shorter path.
// export function wrappedPolyline(latlngs, options) {
// return new L.Wrapped.Polyline(latlngs, options);
// }
