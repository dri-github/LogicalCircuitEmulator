//Стандартные коды клавиш мыши
export const LEFT_MOUSE_BUTTON = 0;
export const CENTER_MOUSE_BUTTON = 1;
export const RIGHT_MOUSE_BUTTON = 2;

export function createVariable(target, name) {
    return {
        value: target.state ? target.state[name] : null,
        setValue: (value) => {
            if (typeof value === "function") {
                target.setState((state) => { return { [name]: Object.assign(state[name], value()) }; });
            } else {
                target.setState((state) => { return { [name]: value }; });
            }
        }
    };
}

export function convertCSSNumber(value, target = value) {
    switch (typeof value) {
        case "number": {
            return Number(value);
        }
        case "string": {
            for (let i = value.length - 1; i >= 0; i--) {
                if (value[i] === '%') {
                    return Number(value.slice(0, i)) / 100 * target;
                }
            }

            return Number(value);
        }
        case "function": {
            return value();
        }
        default:
            return value;
    }
}