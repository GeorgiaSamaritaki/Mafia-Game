export class VoteModel {

    public fromWho: string;
    public toWho: string;
    public round: string;

    constructor(model?: any) {
        Object.assign(this, model);
    }
}
