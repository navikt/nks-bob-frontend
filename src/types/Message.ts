export enum UserType {
    Bruker = 'BRUKER',
    ChatBob = 'CHATBOB'
}

export interface Message {
    userType: UserType;
    text: string;
}