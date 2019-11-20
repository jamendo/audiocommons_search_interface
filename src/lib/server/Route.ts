import { IConstructor } from 'lib/utils/IConstructor';
import { normalize } from 'path';
import { Request, Response } from 'express';
import { Express } from 'express-serve-static-core';

type IRouteConstructor = IConstructor<Route>;

export abstract class Route {
	//#region Route Registry


	/**
	 * Contains a list of all route classes registered with [[Route.registerRouteClass]].
	 */
	private static readonly routeConstructorsByUrl: { [url: string]: IRouteConstructor; } = {};

	/**
	 * Registers a route class for a specific URL in [[routeConstructorsByUrl]].
	 * The URL will be normalized.
	 */
	private static registerRouteClass(url: string, routeClass: IRouteConstructor): void {
		url = Route.normalizeUrl(url);

		if (url in this.routeConstructorsByUrl) {
			throw new Error(`Cannot register route for URL '${url}': URL already in use.`);
		}

		this.routeConstructorsByUrl[url] = routeClass;
	}

	/**
	 * Register a route for a specific URL.
	 */
	protected static url(url: string) {
		return (routeClass: IRouteConstructor): void => {
			this.registerRouteClass(url, routeClass);
		};
	}

	/**
	 * Registers all known routes in a specific express app instance.
	 * @param app The express app to register routes in.
	 */
	public static registerRoutesInExpressApp(app: Express): void {
		for (const url in Route.routeConstructorsByUrl) {
			// We extend the registered route to inject some variables into the class.
			// This way we don't have to rely on a class constructor function, which
			// could easily be overriden.
			// tslint:disable-next-line:variable-name
			const RouteClass = class extends Route.routeConstructorsByUrl[url] {
				protected readonly url = url;
			};

			const route = new RouteClass();

			try {
				route.registerInExpressApp(app);
			} catch (err) {
				throw new Error(`Failed to register route for URL '${url}' in express app: ${err}`);
			}
		}
	}


	//#endregion Route Registry

	//#region Metadata


	/**
	 * Set the HTTP parameters a route expects.
	 */
	public static acceptParams<T extends object>() {
		return (target: Route, methodName: 'get' | 'put' | 'post' | 'delete', descriptor: PropertyDescriptor) => {
			return;
		};
	}


	//#endregion Metadata

	//#region Various Utils


	/**
	 * Normalizes a URL by removing duplicate slashes, dots, etc.
	 * **DO NOT USE THIS FOR FILESYSTEM RELATED PATHS OR ANY PATHS WHERE SECURITY IS CRITICAL!**
	 * @param url The URL to normalize.
	 */
	public static normalizeUrl(url: string): string {
		return (
			normalize(url)
				// this is necessary because Windows uses backslashes:
				.replace(/\\/g, '/')
		);
	}


	//#endregion Various Utils

	//#region Request Handlers

	protected get?(request: Request, response: Response): void | Promise<void>;
	protected post?(request: Request, response: Response): void | Promise<void>;
	protected put?(request: Request, response: Response): void | Promise<void>;
	protected delete?(request: Request, response: Response): void | Promise<void>;

	//#endregion Request Handlers

	//#region Instance Variables


	/**
	 * The URL to which this route is listening.
	 */
	protected readonly url?: string;


	//#endregion Instance Variables

	//#region Internal Methods


	/**
	 * Returns a list of all HTTP methods implemented in this route.
	 */
	private getImplementedHttpMethods() {
		const methods: Array<'get' | 'put' | 'post' | 'delete'> = ['get', 'put', 'post', 'delete'];
		return methods.filter(method => typeof this[method] === 'function');
	}

	/**
	 * Registers a route instance in a specific express app instance.
	 * @param app The express app to register in.
	 */
	private registerInExpressApp(app: Express): void {
		for (const method of this.getImplementedHttpMethods()) {
			const registerInExpress: typeof app.get = app[method].bind(app);

			try {
				registerInExpress(this.url!, (request, response) => this[method]!(request, response));
			} catch (error) {
				throw new Error(
					`Failed to register route handler for method '${method}' at URL ` +
					`'${this.url}' in express app: ${error}`
				);
			}
		}
	}


	//#endregion Internal Methods
}
