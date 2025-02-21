import React, { useState } from "react";
import { Marker, Popup, Tooltip } from "react-leaflet";
import { Button, Comment, Form, Header, TextArea } from "semantic-ui-react";
import L from "leaflet";
import {
  ACTIVE_STATUS,
  FOOD,
  getStatusLevelForType,
  HUMAN_HELP,
  MATERIAL, NEED_REQUIRED, NO_NEED_REQUIRED,
  PACKAGE_STATUS, UNKNOWN_LEVEL,
  URGENT_NEED_REQUIRED
} from "./utils/SiteUtils";

const MAX_TOOLTIP_SIZE = 10;

//Times are kept in UTC timezone in DB so add 3 hours to it
const TIME_DIFFERENCE_IN_MILLIS = 3 * 60 * 60 * 1000;

const HOUSE_ICON = new L.icon({
  iconSize: [35],
  iconUrl: require("./img/house.png"),
});

const HUMAN_ICON = new L.icon({
  iconSize: [35],
  iconUrl: require("./img/human.jpg"),
});
const MATERIAL_ICON = new L.icon({
  iconSize: [35],
  iconUrl: require("./img/material.png"),
});
const FOOD_ICON = new L.icon({
  iconSize: [35],
  iconUrl: require("./img/food.png"),
});
const PACKAGE_ICON = new L.icon({
  iconSize: [35],
  iconUrl: require("./img/package.png"),
});

const NO_NEED_OR_CLOSED_ICON = new L.icon({
  iconSize: [35],
  iconUrl: require("./img/no_need_or_closed_icon.png"),
});

const UNKNOWN_ICON = new L.icon({
  iconSize: [35],
  iconUrl: require("./img/unknown.png"),
});

const SiteMarker = ({ site, addCommentToSite }) => {



  const [humanHelp, setHumanHelp] = useState(
    getStatusLevelForType(site, HUMAN_HELP)
  );
  const [material, setMaterial] = useState(
    getStatusLevelForType(site, MATERIAL)
  );
  const [food, setFood] = useState(getStatusLevelForType(site, FOOD));
  const [packageStatus, setPackageStatus] = useState(
    getStatusLevelForType(site, PACKAGE_STATUS)
  );

  const formatDate = (dateString) => {
    const date = new Date(
      new Date(dateString).getTime() + TIME_DIFFERENCE_IN_MILLIS
    );
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',   hour: 'numeric',
      minute: 'numeric' };
    return date.toLocaleDateString('tr-TR', options);
  };

  const generateGoogleMapsLinkForSite = (site) => {
    return (
      "https://www.google.com/maps/dir/?api=1&destination=" +
      site.location.latitude +
      "," +
      site.location.longitude
    );
  };

  const getPinForSite = (site) => {
    if (site.type === "SHELTER") {
      return HOUSE_ICON;
    }

    if(site.activeStatus ===  ACTIVE_STATUS.NOT_ACTIVE){
      return NO_NEED_OR_CLOSED_ICON;
    }
    if(site.activeStatus === ACTIVE_STATUS.UNKNOWN_ACTIVITY){
      return UNKNOWN_ICON;
    }

    const humanNeedLevel = getStatusLevelForType(site, HUMAN_HELP);
    const materialNeedLevel = getStatusLevelForType(site, MATERIAL);
    const foodNeedLevel = getStatusLevelForType(site, FOOD);
    const packageNeedLevel = getStatusLevelForType(site, PACKAGE_STATUS);

    //Urgent needs
    if (humanNeedLevel === URGENT_NEED_REQUIRED) {
      return HUMAN_ICON;
    }
    if (materialNeedLevel === URGENT_NEED_REQUIRED) {
      return MATERIAL_ICON;
    }
    if (foodNeedLevel === URGENT_NEED_REQUIRED) {
      return FOOD_ICON;
    }
    if (packageNeedLevel === URGENT_NEED_REQUIRED) {
      return PACKAGE_ICON;
    }

    //Need requireds
    if (humanNeedLevel === NEED_REQUIRED) {
      return HUMAN_ICON;
    }
    if (materialNeedLevel === NEED_REQUIRED) {
      return MATERIAL_ICON;
    }
    if (foodNeedLevel === NEED_REQUIRED) {
      return FOOD_ICON;
    }
    if (packageNeedLevel === NEED_REQUIRED) {
      return PACKAGE_ICON;
    }

    //No need requireds
    if (humanNeedLevel === NO_NEED_REQUIRED &&materialNeedLevel === NO_NEED_REQUIRED
        && foodNeedLevel === NO_NEED_REQUIRED && packageNeedLevel === NO_NEED_REQUIRED) {
      return NO_NEED_OR_CLOSED_ICON;
    }
    //Unknown
    return UNKNOWN_ICON;
  };

  const getNameLabel = (siteType) => {
    return siteType === "SHELTER"
      ? "Konaklama Noktası İsmi"
      : "Yardım Noktası İsmi";
  };

  const getOrganizerLabel = (siteType) => {
    return siteType === "SHELTER" ? "Ev Sahibi İsmi" : "Organize Eden Kurum";
  };

  const getTextForSiteStatusLevel = (siteStatusLevel) => {
    switch (siteStatusLevel){
      case UNKNOWN_LEVEL: return  <span style={{color:"gray"}}>Bilinmiyor </span>
      case NO_NEED_REQUIRED: return  <span style={{color:"red"}}>YOK </span>;
      case NEED_REQUIRED: return <span style={{color:"green"}}>VAR </span>;
      case URGENT_NEED_REQUIRED:  return <span style={{color:"green"}}>ACİL VAR </span>
      default: return  <span style="color:green">Bilinmiyor</span>;
    }
  };

  const getStatusLevelTextForType = (site, siteStatusType) => {
    const statusLevel = getStatusLevelForType(site, siteStatusType);
    return getTextForSiteStatusLevel(statusLevel);
  };

  const getSiteActiveText = (activeStatus)=> {

    if(activeStatus === ACTIVE_STATUS.ACTIVE){
      return <span style={{color:"green"}}>AÇIK </span>;
    }
    if(activeStatus === ACTIVE_STATUS.NOT_ACTIVE){
      <span style={{color:"red"}}>KAPALI </span>
    }

    return <span style={{color:"gray"}}>BİLİNMİYOR </span>
  }

  const getSiteNameText = (site)=> {

    let nameColor = "gray";
    if(site.activeStatus === ACTIVE_STATUS.ACTIVE){
      nameColor = "green";
    }else if (site.activeStatus === ACTIVE_STATUS.NOT_ACTIVE){
      nameColor = "red";
    }
    return <span style={{color: nameColor}}>{site.name} </span>
  }
  return (
    <Marker
      position={[site.location.latitude, site.location.longitude]}
      ref={(ref) => (site.markerRef = ref)}
      icon={getPinForSite(site)}
    >
      <Tooltip permanent>
        <span>
          {site.name
            .slice(0, MAX_TOOLTIP_SIZE)
            .trim()
            .concat(site.name.length > MAX_TOOLTIP_SIZE ? "..." : "")}
        </span>
      </Tooltip>
      <Popup>
        <div className="popup-container-div">
          <div className="popup-text-form">
            <div>
              <b>{getNameLabel(site.type)}:</b> {getSiteNameText(site)} Aktiflik: {getSiteActiveText(site.activeStatus)}
            </div>
            <div>
              <b>İlçe:</b> {site.location.district}
            </div>
            <div>
              <b>Adres:</b> {site.location.additionalAddress}
            </div>
            <div>
              <b>Açıklama:</b> {site.description}
            </div>
            <div>
              <b>İletişim Bilgileri:</b>
              {site.contactInformation == ""
                ? "Bilinmiyor"
                : site.contactInformation}
            </div>
            <p></p>
            <div className="need-help-cont">
              <div className="need-help-item">
                <b>İnsan İhtiyacı:</b>
                {getStatusLevelTextForType(site, HUMAN_HELP)}
              </div>
              <div className="need-help-item">
                <b>Materyal İhtiyacı:</b>
                {getStatusLevelTextForType(site, MATERIAL)}
              </div>
              <div className="need-help-item">
                <b>Gıda İhtiyacı:</b> {getStatusLevelTextForType(site, FOOD)}
              </div>
              <div className="need-help-item">
                <b>Koli İhtiyacı:</b>
                {getStatusLevelTextForType(site, PACKAGE_STATUS)}
              </div>
            </div>
            <Button>
              <a href={generateGoogleMapsLinkForSite(site)} target="_blank">
                Bu Alana Yol Tarifi Al
              </a>
            </Button>
          </div>

          <Comment.Group className={"site-comments"}>
            <Header as="h5" dividing>
              Güncellemeler
            </Header>
            {site.updates &&
              site.updates
                .sort((site1, site2) => {
                  return site1.createDateTime < site2.createDateTime ? 1 : -1;
                })
                .filter((update) => update.update && update.update !== "")
                .map((update) => {
                  return (
                    <Comment>
                      <Comment.Content>
                        <Comment.Metadata>
                          <div><b>{formatDate(update.createDateTime)}</b></div>
                        </Comment.Metadata>
                        <Comment.Text>{update.update}</Comment.Text>
                      </Comment.Content>
                    </Comment>
                  );
                })}
            {(site.updates === undefined ||
              site.updates === null ||
              site.updates.length === 0 ||
              site.updates.filter(
                (update) => update.update && update.update !== ""
              ).length === 0) && (
              <Comment>
                <Comment.Content>
                  <Comment.Text>Son güncelleme bulunmuyor.</Comment.Text>
                </Comment.Content>
              </Comment>
            )}
          </Comment.Group>
        </div>
      </Popup>
    </Marker>
  );
};

export default SiteMarker;
