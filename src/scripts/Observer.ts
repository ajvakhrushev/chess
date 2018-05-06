export class Observer {

  private _eventHandlers: Handlers = {};

  on(eventName: string, handler: any, context?: any) {

    if (!this._eventHandlers[eventName]) {
      this._eventHandlers[eventName] = [];
    }
    
    this._eventHandlers[eventName].push({fn: handler, ctx: context});

  }

  off(eventName: string, handler: any) {

    if (!this._eventHandlers || !this._eventHandlers[eventName]) {
      return;
    }

    const handlers = this._eventHandlers[eventName];

    for(let i = 0, length = handlers.length; i < handlers.length; i++) {
      if (handlers[i].fn == handler) {
          handlers.splice(i--, 1);
      }
    }

  }

  trigger(eventName: string) {

    if (!this._eventHandlers || !this._eventHandlers[eventName]) {
      return;
    }

    const args = Array.prototype.slice.call(arguments, 1);

    this._eventHandlers[eventName].forEach((handler: Handler) => {
      handler.fn.apply(handler.ctx || this, args);
    });

  }

}

export interface Handlers {
  [index: string]: Handler[]
};

export interface Handler {
  fn: any;
  ctx: any;
};
