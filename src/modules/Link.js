import { inject, observer } from 'mobx-react';
import BaseLink from './BaseLink';

const Link = inject('routerStore')(observer(BaseLink));

export default Link;
