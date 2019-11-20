//
// Copyright (C) Fabian Lauer, 2018
// From https://gist.github.com/FabianLauer/a8bafdc59bf20c1d1fad02b95d32656d.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// “AS IS” AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NO
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
// FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
// COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
// BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
// LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
// ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.
//

export const enum HttpStatusCode {
	Continue = 100,
	SwitchingProtocols = 101,
	Processing = 102,
	EarlyHints = 103,

	/**
	 * All `1xx` status codes.
	 */
	InformationalResponses = Continue | SwitchingProtocols | Processing | EarlyHints,


	OK = 200,
	Created = 201,
	Accepted = 202,
	NonAuthoritativeInformation = 203,
	NoContent = 204,
	ResetContent = 205,
	PartialContent = 206,
	MultiStatus = 207,
	AlreadyReported = 208,
	IMUsed = 226,

	/**
	 * All `2xx` status codes.
	 */
	Success = (
		OK | Created | Accepted | NonAuthoritativeInformation | NoContent | ResetContent | PartialContent | MultiStatus |
		AlreadyReported | IMUsed
	),


	MultipleChoices = 300,
	MovedPermanently = 301,
	Found = 302,
	SeeOther = 303,
	NotModified = 304,
	UseProxy = 305,
	SwitchProxy = 306,
	TemporaryRedirect = 307,
	PermanentRedirect = 308,

	/**
	 * All `3xx` status codes.
	 */
	Redirection = (
		MultipleChoices | MovedPermanently | Found | SeeOther | NotModified | UseProxy | SwitchProxy | TemporaryRedirect |
		PermanentRedirect
	),


	BadRequest = 400,
	Unauthorized = 401,
	PaymentRequired = 402,
	Forbidden = 403,
	NotFound = 404,
	MethodNotAllowed = 405,
	NotAcceptable = 406,
	ProxyAuthenticationRequired = 407,
	RequestTimeout = 408,
	Conflict = 409,
	Gone = 410,
	LengthRequired = 411,
	PreconditionFailed = 412,
	PayloadTooLarge = 413,
	URITooLong = 414,
	UnsupportedMediaType = 415,
	RangeNotSatisfiable = 416,
	ExpectationFailed = 417,
	ImATeapot = 418,
	MisdirectedRequest = 421,
	UnprocessableEntity = 422,
	Locked = 423,
	FailedDependency = 424,
	UpgradeRequired = 426,
	PreconditionRequired = 428,
	TooManyRequests = 429,
	RequestHeaderFieldsTooLarge = 431,
	UnavailableForLegalReasons = 451,

	/**
	 * All `4xx` error codes.
	 */
	ClientErrors = (
		BadRequest | Unauthorized | PaymentRequired | Forbidden | NotFound | MethodNotAllowed | NotAcceptable |
		ProxyAuthenticationRequired | RequestTimeout | Conflict | Gone | LengthRequired | PreconditionFailed |
		PayloadTooLarge | URITooLong | UnsupportedMediaType | RangeNotSatisfiable | ExpectationFailed | ImATeapot |
		MisdirectedRequest | UnprocessableEntity | Locked | FailedDependency | UpgradeRequired | PreconditionRequired |
		TooManyRequests | RequestHeaderFieldsTooLarge | UnavailableForLegalReasons
	),


	InternalServerError = 500,
	NotImplemented = 501,
	BadGateway = 502,
	ServiceUnavailable = 503,
	GatewayTimeout = 504,
	HTTPVersionNotSupported = 505,
	VariantAlsoNegotiates = 506,
	InsufficientStorage = 507,
	LoopDetected = 508,
	NotExtended = 510,
	NetworkAuthenticationRequired = 511,

	/**
	 * All `5xx` error codes.
	 */
	ServerErrors = (
		InternalServerError | NotImplemented | BadGateway | ServiceUnavailable | GatewayTimeout | HTTPVersionNotSupported |
		VariantAlsoNegotiates | InsufficientStorage | LoopDetected | NotExtended | NetworkAuthenticationRequired
	)
}
