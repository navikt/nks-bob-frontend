export enum UserType {
    Veileder = 'veileder',
    Bob = 'bob'
}

export interface Message {
    userType: UserType;
    text: string;
}