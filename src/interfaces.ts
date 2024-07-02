import { String } from "aws-sdk/clients/apigateway"

export interface PublicPreKey {
    keyId: number
    publicKey: string
    privateKey: String
}

export interface SignedPublicKey {
    keyId: number
    publicKey: string
    privateKey: string
    signature: string
}
export interface FullKeyBundle {
    identityKey: ArrayBuffer,
    registrationId: number,
    signedPreKey: SignedPublicKey
    oneTimePreKeys: PublicPreKey[]
}

export interface KeyTableItem extends FullKeyBundle {
    address: string
    created: number
    updated: number
}

export interface PublicPreKeyBundle {
    identityKey: ArrayBuffer,
    registrationId: number,
    signedPreKey: SignedPublicKey,
    oneTimePreKeys: PublicPreKey[]
}

export interface MessageTableItem {
    address: string
    timestamp: number
    message: EncryptedMessage,
    ownMessage: EncryptedMessage,
}

export interface EncryptedMessage {
    type: number,
    body: string,
    registrationId: number
}

export interface CreateRoomRequest {
    name: string
    password: string
    username: string
}

export interface JoinRoomRequest {
    name: string
    password: string
}

export interface Room {
    _id: string
    users: [string]
    isFull: boolean
}

export interface AddMessageRequest {
    address: string
    message: EncryptedMessage
    ownMessage: EncryptedMessage
}

export interface Message {
    roomId: string
    address: string
    message: EncryptedMessage
    ownMessage: EncryptedMessage
    timestamp: number
}