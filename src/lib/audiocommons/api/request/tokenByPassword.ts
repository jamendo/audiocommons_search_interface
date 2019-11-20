export interface ITokenByPasswordRequest {
	client_id: string;
	grant_type: 'password';
	username: string;
	password: string;
}

export interface ITokenByPasswordResponse {
	REQUEST: ITokenByPasswordRequest;
	access_token: string;
	expires_in: number;
	token_type: 'Bearer';
	scope: 'read';
	refresh_token: string;
}
