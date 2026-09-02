'use strict';

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.simoens-inline-event-covalente-001').forEach((element) => {
    element.addEventListener('focus', function (event) {
      this.style.left='1rem';this.style.top='1rem';this.style.width='auto';this.style.height='auto';this.style.overflow='visible';
    });
    element.addEventListener('blur', function (event) {
      this.style.left='-9999px';this.style.width='1px';this.style.height='1px';this.style.overflow='hidden';
    });
  });
});
