import { Usuario } from "../../models/user"; 

// export interface AuthResponse {
//     user: Usuario;
//     token: string;
// }
 export interface AuthResponse {
    access_token: string;
    user:         UserResponse;
}

export interface UserResponse {
    id:                 string;
    aud:                string;
    role:               string;
    email:              string;
    email_confirmed_at: Date;
    phone:              string;
    confirmed_at:       Date;
    last_sign_in_at:    Date;
    app_metadata:       AppMetadata;
    user_metadata:      Data;
    identities:         Identity[];
    created_at:         Date;
    updated_at:         Date;
    is_anonymous:       boolean;
}

export interface AppMetadata {
    provider:  string;
    providers: string[];
}

export interface Identity {
    identity_id:     string;
    id:              string;
    user_id:         string;
    identity_data:   Data;
    provider:        string;
    last_sign_in_at: Date;
    created_at:      Date;
    updated_at:      Date;
    email:           string;
}

export interface Data {
    email:          string;
    email_verified: boolean;
    nombre:         string;
    phone_verified: boolean;
    role:           string;
    sub:            string;
}
