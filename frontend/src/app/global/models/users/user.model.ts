export class UserModel {

    public name: string;
    public avatar: string;
    public role: string;
  
    constructor(model?: any) {
      Object.assign(this, model);
    }
  
  }