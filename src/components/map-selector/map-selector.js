import React, { PureComponent } from "react";

export class MapSelector extends PureComponent {
  state = {
    maps: []
  };

  constructor(props) {
    super(props);
    this.fetchAllowedMaps().then(result => {
      this.setState({ maps: result });
    });
  }

  async login() {
    const login = {
      username: "demo_user",
      password: "demo_user"
    };

    const request = new Request("https://api.birdsai.co/api/login");

    // const formBody = Object.keys(login)
    //   .map(
    //     key => encodeURIComponent(key) + "=" + encodeURIComponent(login[key])
    //   )
    //   .join("&");
    const formBody = JSON.stringify(login);
    const response = await fetch(request, {
      method: "POST",
      headers: {
        "Content-Type": "application/json;charset=UTF-8"
      },
      body: formBody,
      credentials: "include"
    });

    return response;
  }

  async fetchAllowedMaps() {
    const response = await this.login();
    if (response.ok) {
      const allowedMaps = await fetch(
        "https://api.birdsai.co/api/getallowedmaps",
        {
          credentials: "include"
        }
      );
      return await allowedMaps.json();
    } else {
      return null;
    }
  }

  selectMap = $event => {
    if (!$event.target.value) {
      this.props.onSelect();
    } else {
      this.props.onSelect(JSON.parse($event.target.value));
    }
  };

  render() {
    return (
      <select onChange={this.selectMap}>
        <option value="">Select a map</option>
        {this.state.maps.map(map => (
          <option key={map.uuid} value={JSON.stringify(map)}>
            {map.name}
          </option>
        ))}
      </select>
    );
  }
}
