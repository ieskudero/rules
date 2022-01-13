export class Rule {
    constructor() {
        this.id = -1;
        this.idNode = 1000;
        this.name='';
        this.description='';
        this.rule='';
        this.lastUpdateDate = Date.now();
    }

    toJSON() {
        return {
            id: this.id,
            idNode: this.idNode,
            name: this.name,
            description: this.description,
            rule: this.rule,
            lastUpdateDate: this.lastUpdateDate
        }
    }
}