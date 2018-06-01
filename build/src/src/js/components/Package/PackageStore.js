import React from "react";
import params from "Params";
import ClipboardJS from 'clipboard';

new ClipboardJS('.btn');

let imageArchie = {
  'nginx-proxy.dnp.dappnode.eth': 'https://image.ibb.co/gBe8R7/Nginx.png',
  'letsencrypt-nginx.dnp.dappnode.eth': 'https://image.ibb.co/f3yzzS/letsencrypt.png'
}
let defaultImg = 'https://pbs.twimg.com/profile_images/828669925996781569/4clLqawr.jpg'

class Card extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    let name = this.props._package.name
    let status = this.props._package.status
    let id = name;

    let namePretty = capitalize( name.split('.dnp.dappnode.eth')[0] )
    let img = this.props._package.avatar || defaultImg
    let allowInstall = Boolean(this.props._package.disableInstall)
    let tag = this.props._package.tag

    // ##### Text under the card's title showing the status
    // <p class="card-text">Status: {status}</p>

    return (
      <div class="col-lg-3 col-md-4 col-sm-6 portfolio-item mb-4 box-shadow card-max-width">
        <div class="card h-100">
          <div class="p-1">
            <img class="card-img-top" src={img} alt="Card image cap" />
          </div>
          <div class="card-body text-center text-nowrap">
            <h5 class="card-title">{namePretty}</h5>
            <div class="center-block">
              <button class="btn btn-outline-secondary" type="button"
                data-toggle="modal"
                data-target={this.props.modalTarget}
                onClick={this.props.preInstallPackage}
                id={id}
                disabled={allowInstall}
                >{tag}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default class PackageDirectory extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let cards = [];
    const directory = this.props.directory || []
    for (let i = 0; i < directory.length; i++) {
      let _package = directory[i];
      cards.push(
        <Card
          _package={_package}
          key={i}
          preInstallPackage={this.props.preInstallPackage}
          modalTarget={this.props.modalTarget}
        />
      );
    }

    return (
      <div class="row">
        {cards}
      </div>
    );
  }
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}