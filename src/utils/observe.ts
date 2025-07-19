type ChangeCallback = (path: string, oldValue: any, newValue: any) => void;

export function observe<T extends object>(obj: T, onChange: ChangeCallback, path: string[] = []): T {
  if (obj !== Object(obj) || obj instanceof Date || obj instanceof RegExp || obj instanceof Function) {
    return obj;
  }

  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'object' && value !== null) {
        return observe(value, onChange, path.concat(String(prop)));
      }
      return value;
    },

    set(target, prop, value, receiver) {
      const oldValue = (target as any)[prop];
      const fullPath = path.concat(String(prop)).join('.');

      if (oldValue !== value) {
        const result = Reflect.set(target, prop, value, receiver);
        onChange(fullPath, oldValue, value);
        return result;
      }

      return true;
    }
  });
}
