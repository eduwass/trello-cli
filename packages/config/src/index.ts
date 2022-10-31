import * as path from "path";
import * as fs from "fs";

const homePath =
  process.env[process.platform == "win32" ? "USERPROFILE" : "HOME"];

if (!homePath) {
  throw new Error("Could not determine home folder");
}

const profile = process.env.TRELLO_CLI_PROFILE || "default";

const configFileDir = path.resolve(homePath, ".trello-cli", profile);
const configFilePath = path.resolve(configFileDir, "config.json");
const authFilePath = path.resolve(configFileDir, "authentication.json");

class __ {
  static getToken = () => {
    const appKey = __.getAppKey();
    __.ensureAuthenticationTokenExists(appKey);
    return __.loadToken();
  };

  static loadToken() {
    const auth = JSON.parse(fs.readFileSync(authFilePath).toString());
    return auth.token;
  }

  static setToken(token: string) {
    fs.writeFileSync(
      authFilePath,
      JSON.stringify({
        token,
      })
    );
  }

  static setApiKey(appKey: string) {
    if (!fs.existsSync(configFileDir)) {
      fs.mkdirSync(configFileDir, "0700");
    }

    fs.writeFileSync(
      configFilePath,
      JSON.stringify({
        appKey,
      })
    );
  }

  static authFileExists() {
    return fs.existsSync(authFilePath);
  }

  static ensureAuthenticationTokenExists(appKey: string) {
    if (!__.authFileExists() || !__.loadToken()) {
      const authenticationUrl =
        "https://trello.com/1/connect?key=" +
        appKey +
        "&name=trello-cli&response_type=token&scope=account,read,write&expiration=never";

      throw {
        message: `The [token] field is missing from ${authFilePath}`,
        code: "ERR_NO_AUTH_TOKEN",
        data: {
          authenticationUrl,
        },
      };
    }
  }

  static getAppKey() {
    __.ensureConfigFileExists();
    return __.loadAppKey();
  }

  static loadAppKey() {
    const c = JSON.parse(fs.readFileSync(configFilePath).toString());
    return c.appKey;
  }

  static ensureConfigFileExists(): { message: string } {
    let message = `Config file found at ${configFilePath}`;

    if (!__.configFileExists()) {
      throw {
        message: `Go to https://trello.com/app-key to generate your API key and replace YOURAPIKEY in ${configFilePath}`,
        code: "ERR_NO_APP_KEY",
        data: {
          url: "https://trello.com/app-key",
        },
      };
    }

    return {
      message,
    };
  }

  static configFileExists(): boolean {
    return fs.existsSync(configFilePath);
  }
}

export default __;