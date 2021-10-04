export class UserModel {

  public name: string;
  public avatar_path: string;
  public role: string;
  public position: number;
  public dead: string;

  constructor(model?: any) {
    Object.assign(this, model);
  }

}