
/**
 * Generic utility for managing callback functions.
 *  - Add or remove callbacks functions.
 *  - Invoke all of them together with any arguments.
 * 
 * Caller instances make handy events which are open for subscription.
 */
export default class Caller<F extends Function> {

  /** Array of subscribed callbacks. */
  private callbacks: F[] = []

  /**
   * Subscribe a callback function.
   */
  add(callback: F) {
    this.callbacks.push(callback)
  }

  /**
   * Unsubscribe a callback function.
   */
  remove(callback: F) {
    this.callbacks = this.callbacks.filter(cb => cb !== callback)
  }

  /**
   * Unsubscribe all.
   */
  clear() {
    this.callbacks = []
  }

  /**
   * Fire every subscribed callback.
   */
  invoke(...args) {
    for (const callback of this.callbacks) callback.apply(null, args)
  }
}
