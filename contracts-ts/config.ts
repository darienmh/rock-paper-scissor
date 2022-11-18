export class Config {
  get contracts(): { [key: string]: string } {
    return {};
  }

  get gameAddress(): string {
    return "0x47Ca98659a8627eAa7e682E9B5597dC7ebFeb14F";
  }

  get erc20Address(): string {
    return "0xfe4F5145f6e09952a5ba9e956ED0C25e3Fa4c7F1";
  }
}

export const config = new Config();
