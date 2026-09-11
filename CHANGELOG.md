# Changelog

## 1.0.0 (2026-09-11)


### Features

* **about:** one shared About at /about ([30f70c3](https://github.com/cheminfo/polycarp.cheminfo.org/commit/30f70c327e363c313022ed90c81b98b9d9178ada))
* add nginx reverse proxy config for /api/ route ([e2e25f1](https://github.com/cheminfo/polycarp.cheminfo.org/commit/e2e25f106cde4fcac80f09547fcc4f6781aa3d49))
* add Results tab + redirect Data tab to NOMAD (closes [#8](https://github.com/cheminfo/polycarp.cheminfo.org/issues/8)) ([ee57904](https://github.com/cheminfo/polycarp.cheminfo.org/commit/ee5790495d442a325bf5b91307dae299496ed6e7))
* add User Guide tab, API docs tab, and richer About content ([e4f591e](https://github.com/cheminfo/polycarp.cheminfo.org/commit/e4f591e34e89e4f4ad8eaf49ebd333c75d22cd48))
* adopt the standard project shape, chrome and indexed routes ([3444853](https://github.com/cheminfo/polycarp.cheminfo.org/commit/344485318a7d8926d80548a71178c06a48c7abb7))
* brand refresh + redesigned prediction view + lookup fixes ([f5532fc](https://github.com/cheminfo/polycarp.cheminfo.org/commit/f5532fc522f49e43b27f54eb57438af08aeea815))
* brand refresh + redesigned prediction view + lookup fixes ([f81aad3](https://github.com/cheminfo/polycarp.cheminfo.org/commit/f81aad370da01001ad6be96822eb24a8e766b5a4))
* extract compose configuration into .env variables ([6f5f75a](https://github.com/cheminfo/polycarp.cheminfo.org/commit/6f5f75a48d3f81a80fa67b0589750fff932d3217))
* highlight when nearest-neighbour lookup disagrees with the model ([945a074](https://github.com/cheminfo/polycarp.cheminfo.org/commit/945a07487225a387126737885cccd9cd9aab1ec4))
* highlight when nearest-neighbour lookup disagrees with the model ([1ffffeb](https://github.com/cheminfo/polycarp.cheminfo.org/commit/1ffffebcba563ac1e280d1fb67fc120de6d87a8f))
* increase timeout ([d026773](https://github.com/cheminfo/polycarp.cheminfo.org/commit/d0267738a70dc9f33faf3fa4b48ee5fcfdd4fa59))
* initial project scaffold ([dcbc0e9](https://github.com/cheminfo/polycarp.cheminfo.org/commit/dcbc0e9d89fd2449bc5e25be1518f4f3cbd46501))
* load visualizer from lactame.com CDN ([069403b](https://github.com/cheminfo/polycarp.cheminfo.org/commit/069403b19c20ef64a3fc2ec738fd4c32920c30bf))
* make nearest database results sortable and filterable ([3595ec5](https://github.com/cheminfo/polycarp.cheminfo.org/commit/3595ec50b89876ffa6796432ec78d510e908cbdb)), closes [#3](https://github.com/cheminfo/polycarp.cheminfo.org/issues/3)
* mark same-monomer rows in nearest database results ([d54b8e9](https://github.com/cheminfo/polycarp.cheminfo.org/commit/d54b8e91d1109c409071a6f98c0c0e7f0befd7dc))
* mark same-monomer rows in nearest database results ([fa50a05](https://github.com/cheminfo/polycarp.cheminfo.org/commit/fa50a05f9a879962f82a72177f218529ce475098))
* replace inline molecule editors with compact card + dialog UI ([16424dd](https://github.com/cheminfo/polycarp.cheminfo.org/commit/16424dd53ff390e049c13ca990ebda287e23e5ba))
* Results tab reproducing the paper's train/test metrics (closes [#8](https://github.com/cheminfo/polycarp.cheminfo.org/issues/8)) ([0ce4a15](https://github.com/cheminfo/polycarp.cheminfo.org/commit/0ce4a1524ddc6de3edfb72b8f4aca7630dac5ec9))
* separate locked visualizer config into config_lock.json ([562d92d](https://github.com/cheminfo/polycarp.cheminfo.org/commit/562d92dbd34c97db32462c498035fe3f251e6e15))
* split prediction results into Blueprint sub-tabs ([f8553cb](https://github.com/cheminfo/polycarp.cheminfo.org/commit/f8553cb5e03867a157763a9c6871540567a4acc3))
* take the chrome and the prerendering from react-cheminfo ([84d0f91](https://github.com/cheminfo/polycarp.cheminfo.org/commit/84d0f918be8a92626afc67d3f94ec1085ffdd416))


### Bug Fixes

* clear stale results before each new prediction run ([0f6a8ef](https://github.com/cheminfo/polycarp.cheminfo.org/commit/0f6a8efbfc9aa4e6c66ac7c3e06cc9539dac521c))
* **deps:** take react-cheminfo 0.9.0 ([91fbd16](https://github.com/cheminfo/polycarp.cheminfo.org/commit/91fbd16bdec07661e089600d3e9aed24bb8ea82d))
* highlight active prediction sub-tab with orange bottom stripe ([ed3360b](https://github.com/cheminfo/polycarp.cheminfo.org/commit/ed3360bb43aeb81d9d0ed8f13a4400e81572496e))
* make architecture class colors consistent across UI elements ([044f06a](https://github.com/cheminfo/polycarp.cheminfo.org/commit/044f06a60ea02657c0f449d0ca6daa46c96cd64a))
* make the analytics id in .env.example a zeroed placeholder ([c6a7fde](https://github.com/cheminfo/polycarp.cheminfo.org/commit/c6a7fde0322fc31b7e8b919dc4aacdfc7979c612))
* prevent structure editor redraw on every onChange event ([d4bab44](https://github.com/cheminfo/polycarp.cheminfo.org/commit/d4bab44ab38ee60b6d49ce1e8501c1e10b33b83b))
* remove cap_drop from frontend, add restart policy ([b8c996d](https://github.com/cheminfo/polycarp.cheminfo.org/commit/b8c996d94ba7254d22df385a20aeeb0cf4dfe954))
* resolve eslint errors in merged UI changes ([fc2ce96](https://github.com/cheminfo/polycarp.cheminfo.org/commit/fc2ce96df76c9715e270bd88b99e2d663ee91730))
* retune the pair to grape and lime ([974350a](https://github.com/cheminfo/polycarp.cheminfo.org/commit/974350a09541a23fa92a05d22a3441c50ed0d8f3))
* show real class names in optimization grid legend ([0c470a4](https://github.com/cheminfo/polycarp.cheminfo.org/commit/0c470a4494eb0ad04d478bf89a86e9c7ea5029aa))
* strip null features before calling /predict ([cc20a45](https://github.com/cheminfo/polycarp.cheminfo.org/commit/cc20a45d8035f564dcbed01621b1ff0e931357c4))
* unlock visualizer view ([ae86563](https://github.com/cheminfo/polycarp.cheminfo.org/commit/ae86563c6f87669a3e0c62301fda5b31af9677c7))
* upgrade Node base image from 20 to 24 in Dockerfile ([eb9759c](https://github.com/cheminfo/polycarp.cheminfo.org/commit/eb9759c3126801c9baee9bab92995048859062ab))
