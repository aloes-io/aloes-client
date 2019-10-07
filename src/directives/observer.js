const buildThresholdList = () => {
  let thresholds = [];
  let numSteps = 20;
  for (let i = 1.0; i <= numSteps; i++) {
    let ratio = i / numSteps;
    thresholds.push(ratio);
  }
  thresholds.push(0);
  return thresholds;
};

const Observer = {
  inserted: (el, binding, vNode) => {
    const options = {
      root: el,
      rootMargin: `${binding.arg.margin}px` || '0px',
      threshold: buildThresholdList(),
    };

    const callback = ([obs]) => {
      const detail = { obs };
      if (vNode.componentInstance) vNode.componentInstance.$emit('intersected', { detail });
      else vNode.elm.dispatchEvent(new CustomEvent('intersected', { detail }));
    };

    el.observer = new IntersectionObserver(callback, options);
    const element = el.querySelector(`#${binding.value}`);
    if (element) el.observer.observe(element);
  },

  update: (el, binding) => {
    if (el.observer && binding.oldValue && binding.value !== binding.oldValue) {
      const oldElement = el.querySelector(`#${binding.oldValue}`);
      if (oldElement) el.observer.unobserve(oldElement);
    }
  },

  componentUpdated: (el, binding) => {
    if (el.observer && binding.value) {
      setTimeout(() => {
        const element = el.querySelector(`#${binding.value}`);
        if (element) el.observer.observe(element);
      }, 200);
    }
  },

  unbind: el => {
    if (el.observer) el.observer.disconnect();
  },
};

export default Observer;
