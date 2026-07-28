import { makeAutoObservable } from "mobx";
export default class CounterStore {
  title = "Counter store";
  count = 42;
  events: string[] = [`initial counter is ${this.count}`];

  constructor() {
    makeAutoObservable(this);
  }
  increment = (amount = 1) => {
    this.count += amount;
    this.events.push(`incremented by ${amount} the count is now ${this.count}`);
  };

  decrement = (amount = 1) => {
    this.count -= amount;
    this.events.push(`decreased by ${amount} the count is now ${this.count}`);
  };

  get eventCounter(){
    return this.events.length
  }
}
