export interface PublicPreKey {
    keyId: number
    publicKey: string
}

export interface SignedPublicKey {
    keyId: number
    publicKey: string
    signature: string
}
export interface FullKeyBundle {
    registrationId: number
    identityKey: string
    signedPreKey: SignedPublicKey
    oneTimePreKeys: PublicPreKey[]
}

export interface KeyTableItem extends FullKeyBundle {
    address: string
    created: number
    updated: number
}

export interface PublicPreKeyBundle {
    identityKey: string
    signedPreKey: SignedPublicKey
    preKey?: PublicPreKey
    registrationId: number
}

export interface MessageTableItem {
    address: string
    sortID: string
    message: string
}