export class CreateGroupSecondStepModel {
    constructor(public groupType : any, public groupIcon : any, public groupName : string, public description : string, public members : any = [], public groupIconDisplay : boolean = false) {}
}
