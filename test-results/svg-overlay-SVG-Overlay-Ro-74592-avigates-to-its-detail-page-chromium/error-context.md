# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: svg-overlay.spec.ts >> SVG Overlay & Routing Audit >> 3 · e2e click — clicking the first ground-floor space navigates to its detail page
- Location: tests/svg-overlay.spec.ts:193:7

# Error details

```
Error: expect(received).not.toMatch(expected)

Expected pattern: not /404|this page could not be found|page not found/i
Received string:      "piramidabackstagespacesSpaces/Ground Floor/Space A1available·extension← all spacesA1Space A1Hapësira A190paxcapacity85m²area3.6mceiling€95/hrratePremium modular space on the octagonal perimeter ring of the newly revitalized Pyramid of Tirana, ideal for workshops, tech events, and creative sessions. Natural concrete finishes and flexible layout options accommodate up to 90 guests in theater, roundtable, or standing configuration.included featuresprojectornatural lightavailable layoutsroundtablestandingflexspecificationsspace codeA1floorGround Floorcategoryextensionarea85m²capacity90paxceiling height3.6mhourly rate€95+ VATrequest this spacedatefromuntilattendees (max 90)your nameemailestimated total (incl. 18% vat)€4484h × €95/hr + VATrequest bookingaiself.__next_r=\"fX_Df0V4pke3OIFmIEciB\"(self.__next_f=self.__next_f||[]).push([0])self.__next_f.push([1,\"a:I[\\\"[project]/node_modules/next/dist/next-devtools/userspace/app/segment-explorer-node.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\"],\\\"SegmentViewNode\\\"]\\nc:\\\"$Sreact.fragment\\\"\\n20:I[\\\"[project]/node_modules/next/dist/client/components/layout-router.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\"],\\\"default\\\"]\\n22:I[\\\"[project]/node_modules/next/dist/client/components/render-from-template-context.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\"],\\\"default\\\"]\\n34:I[\\\"[project]/components/chatbot/chatbot-root.tsx [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\"],\\\"ChatbotRoot\\\"]\\n3b:I[\\\"[project]/node_modules/next/dist/client/components/client-page.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\"],\\\"ClientPageRoot\\\"]\\n3c:I[\\\"[project]/app/spaces/page.tsx [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\",\\\"/_next/static/chunks/_1xdd44d._.js\\\",\\\"/_next/static/chunks/node_modules_1w47k1l._.js\\\",\\\"/_next/static/chunks/app_spaces_page_tsx_0-p-4mv._.js\\\"],\\\"default\\\"]\\n45:I[\\\"[project]/node_modules/next/dist/lib/framework/boundary-components.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\"],\\\"OutletBoundary\\\"]\\n47:\\\"$Sreact.suspense\\\"\\n55:I[\\\"[project]/node_modules/next/dist/lib/framework/boundary-components.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\"],\\\"ViewportBoundary\\\"]\\n5f:I[\\\"[project]/node_modules/next/dist/lib/framework/boundary-components.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\"],\\\"MetadataBoundary\\\"]\\n66:I[\\\"[project]/node_modules/next/dist/client/components/builtin/global-error.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\",\\\"/_next/static/chunks/node_modules_next_dist_client_components_builtin_global-error_0-p-4mv.js\\\"],\\\"default\\\",1]\\n74:I[\\\"[project]/node_modules/next/dist/lib/metadata/generate/icon-mark.js [app-client] (ecmascript)\\\",[\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\"],\\\"IconMark\\\"]\\n:HL[\\\"/_next/static/chunks/%5Broot-of-the-server%5D__0vhnoi5._.css\\\",\\\"style\\\"]\\n:HL[\\\"/_next/static/media/051742360c26797e-s.p.1bkzbscqrt8rl.woff2\\\",\\\"font\\\",{\\\"crossOrigin\\\":\\\"\\\",\\\"type\\\":\\\"font/woff2\\\"}]\\n:HL[\\\"/_next/static/media/0c89a48fa5027cee-s.p.2cyn07wtgehh0.woff2\\\",\\\"font\\\",{\\\"crossOrigin\\\":\\\"\\\",\\\"type\\\":\\\"font/woff2\\\"}]\\n:HL[\\\"/_next/static/media/83afe278b6a6bb3c-s.p.2bn3s6zvc0dyp.woff2\\\",\\\"font\\\",{\\\"crossOrigin\\\":\\\"\\\",\\\"type\\\":\\\"font/woff2\\\"}]\\n1:D\\\"$7\\\"\\n1:D\\\"$2\\\"\\n1:D\\\"$8\\\"\\n1:null\\n11:D\\\"$1b\\\"\\n11:D\\\"$12\\\"\\n11:D\\\"$1d\\\"\\n24:D\\\"$26\\\"\\n24:D\\\"$25\\\"\\n24:D\\\"$28\\\"\\n24:D\\\"$27\\\"\\n24:D\\\"$29\\\"\\n24:[[\\\"$\\\",\\\"title\\\",null,{\\\"children\\\":\\\"404: This page could not be found.\\\"},\\\"$27\\\",\\\"$2a\\\",1],[\\\"$\\\",\\\"div\\\",null,{\\\"style\\\":{\\\"fontFamily\\\":\\\"system-ui,\\\\\\\"Segoe UI\\\\\\\",Roboto,Helvetica,Arial,sans-serif,\\\\\\\"Apple Color Emoji\\\\\\\",\\\\\\\"Segoe UI Emoji\\\\\\\"\\\",\\\"height\\\":\\\"100vh\\\"\"])self.__next_f.push([1,\",\\\"textAlign\\\":\\\"center\\\",\\\"display\\\":\\\"flex\\\",\\\"flexDirection\\\":\\\"column\\\",\\\"alignItems\\\":\\\"center\\\",\\\"justifyContent\\\":\\\"center\\\"},\\\"children\\\":[\\\"$\\\",\\\"div\\\",null,{\\\"children\\\":[[\\\"$\\\",\\\"style\\\",null,{\\\"dangerouslySetInnerHTML\\\":{\\\"__html\\\":\\\"body{color:#000;background:#fff;margin:0}.next-error-h1{border-right:1px solid rgba(0,0,0,.3)}@media (prefers-color-scheme:dark){body{color:#fff;background:#000}.next-error-h1{border-right:1px solid rgba(255,255,255,.3)}}\\\"}},\\\"$27\\\",\\\"$2d\\\",1],[\\\"$\\\",\\\"h1\\\",null,{\\\"className\\\":\\\"next-error-h1\\\",\\\"style\\\":{\\\"display\\\":\\\"inline-block\\\",\\\"margin\\\":\\\"0 20px 0 0\\\",\\\"padding\\\":\\\"0 23px 0 0\\\",\\\"fontSize\\\":24,\\\"fontWeight\\\":500,\\\"verticalAlign\\\":\\\"top\\\",\\\"lineHeight\\\":\\\"49px\\\"},\\\"children\\\":404},\\\"$27\\\",\\\"$2e\\\",1],[\\\"$\\\",\\\"div\\\",null,{\\\"style\\\":{\\\"display\\\":\\\"inline-block\\\"},\\\"children\\\":[\\\"$\\\",\\\"h2\\\",null,{\\\"style\\\":{\\\"fontSize\\\":14,\\\"fontWeight\\\":400,\\\"lineHeight\\\":\\\"49px\\\",\\\"margin\\\":0},\\\"children\\\":\\\"This page could not be found.\\\"},\\\"$27\\\",\\\"$30\\\",1]},\\\"$27\\\",\\\"$2f\\\",1]]},\\\"$27\\\",\\\"$2c\\\",1]},\\\"$27\\\",\\\"$2b\\\",1]]\\n11:[\\\"$\\\",\\\"html\\\",null,{\\\"lang\\\":\\\"en\\\",\\\"className\\\":\\\"space_grotesk_57724b92-module__dzWcbW__variable inter_1f71dc82-module__VV7LFa__variable jetbrains_mono_ec76ef60-module__y36ooG__variable\\\",\\\"children\\\":[\\\"$\\\",\\\"body\\\",null,{\\\"className\\\":\\\"min-h-screen antialiased\\\",\\\"style\\\":{\\\"backgroundColor\\\":\\\"var(--color-concrete-bone)\\\",\\\"color\\\":\\\"var(--color-concrete-char)\\\",\\\"fontFamily\\\":\\\"var(--font-body)\\\"},\\\"children\\\":[[\\\"$\\\",\\\"$L20\\\",null,{\\\"parallelRouterKey\\\":\\\"children\\\",\\\"error\\\":\\\"$undefined\\\",\\\"errorStyles\\\":\\\"$undefined\\\",\\\"errorScripts\\\":\\\"$undefined\\\",\\\"template\\\":[\\\"$\\\",\\\"$L22\\\",null,{},null,\\\"$21\\\",1],\\\"templateStyles\\\":\\\"$undefined\\\",\\\"templateScripts\\\":\\\"$undefined\\\",\\\"notFound\\\":[\\\"$\\\",\\\"$La\\\",\\\"c-not-found\\\",{\\\"type\\\":\\\"not-found\\\",\\\"pagePath\\\":\\\"__next_builtin__not-found.js\\\",\\\"children\\\":[\\\"$24\\\",[]]},null,\\\"$23\\\",0],\\\"forbidden\\\":\\\"$undefined\\\",\\\"unauthorized\\\":\\\"$undefined\\\",\\\"segmentViewBoundaries\\\":[[\\\"$\\\",\\\"$La\\\",null,{\\\"type\\\":\\\"boundary:not-found\\\",\\\"pagePath\\\":\\\"__next_builtin__not-found.js@boundary\\\"},null,\\\"$31\\\",1],\\\"$undefined\\\",\\\"$undefined\\\",[\\\"$\\\",\\\"$La\\\",null,{\\\"type\\\":\\\"boundary:global-error\\\",\\\"pagePath\\\":\\\"__next_builtin__global-error.js\\\"},null,\\\"$32\\\",1]]},null,\\\"$1f\\\",1],[\\\"$\\\",\\\"$L34\\\",null,{},\\\"$12\\\",\\\"$33\\\",1]]},\\\"$12\\\",\\\"$1e\\\",1]},\\\"$12\\\",\\\"$1c\\\",1]\\n40:D\\\"$42\\\"\\n40:D\\\"$41\\\"\\n40:D\\\"$44\\\"\\n40:[\\\"$\\\",\\\"$L45\\\",null,{\\\"children\\\":[\\\"$\\\",\\\"$47\\\",null,{\\\"name\\\":\\\"Next.MetadataOutlet\\\",\\\"children\\\":\\\"$@48\\\"},\\\"$41\\\",\\\"$46\\\",1]},\\\"$41\\\",\\\"$43\\\",1]\\n4b:D\\\"$4e\\\"\\n4b:D\\\"$4c\\\"\\n4b:D\\\"$4f\\\"\\n4b:null\\n50:D\\\"$52\\\"\\n50:D\\\"$51\\\"\\n50:D\\\"$54\\\"\\n56:D\\\"$58\\\"\\n56:D\\\"$57\\\"\\n50:[\\\"$\\\",\\\"$L55\\\",null,{\\\"children\\\":\\\"$L56\\\"},\\\"$51\\\",\\\"$53\\\",1]\\n59:D\\\"$5b\\\"\\n59:D\\\"$5a\\\"\\n59:D\\\"$5d\\\"\\n61:D\\\"$63\\\"\\n61:D\\\"$62\\\"\\n59:[\\\"$\\\",\\\"div\\\",null,{\\\"hidden\\\":true,\\\"children\\\":[\\\"$\\\",\\\"$L5f\\\",null,{\\\"children\\\":[\\\"$\\\",\\\"$47\\\",null,{\\\"name\\\":\\\"Next.Metadata\\\",\\\"children\\\":\\\"$L61\\\"},\\\"$5a\\\",\\\"$60\\\",1]},\\\"$5a\\\",\\\"$5e\\\",1]},\\\"$5a\\\",\\\"$5c\\\",1]\\n65:[]\\n\"])self.__next_f.push([1,\"0:{\\\"P\\\":\\\"$1\\\",\\\"c\\\":[\\\"\\\",\\\"spaces\\\"],\\\"q\\\":\\\"\\\",\\\"i\\\":true,\\\"f\\\":[[[\\\"\\\",{\\\"children\\\":[\\\"spaces\\\",{\\\"children\\\":[\\\"__PAGE__\\\",{}]}]},\\\"$undefined\\\",\\\"$undefined\\\",16],[[\\\"$\\\",\\\"$La\\\",\\\"layout\\\",{\\\"type\\\":\\\"layout\\\",\\\"pagePath\\\":\\\"layout.tsx\\\",\\\"children\\\":[\\\"$\\\",\\\"$c\\\",\\\"c\\\",{\\\"children\\\":[[[\\\"$\\\",\\\"link\\\",\\\"0\\\",{\\\"rel\\\":\\\"stylesheet\\\",\\\"href\\\":\\\"/_next/static/chunks/%5Broot-of-the-server%5D__0vhnoi5._.css\\\",\\\"precedence\\\":\\\"next_static/chunks/[root-of-the-server]__0vhnoi5._.css\\\",\\\"crossOrigin\\\":\\\"$undefined\\\",\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$d\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-0\\\",{\\\"src\\\":\\\"/_next/static/chunks/node_modules_next_12whqff._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$e\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-1\\\",{\\\"src\\\":\\\"/_next/static/chunks/components_chatbot_0vfsexr._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$f\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-2\\\",{\\\"src\\\":\\\"/_next/static/chunks/app_layout_tsx_007e4b2._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$10\\\",0]],\\\"$11\\\"]},null,\\\"$b\\\",1]},null,\\\"$9\\\",0],{\\\"children\\\":[[\\\"$\\\",\\\"$c\\\",\\\"c\\\",{\\\"children\\\":[null,[\\\"$\\\",\\\"$L20\\\",null,{\\\"parallelRouterKey\\\":\\\"children\\\",\\\"error\\\":\\\"$undefined\\\",\\\"errorStyles\\\":\\\"$undefined\\\",\\\"errorScripts\\\":\\\"$undefined\\\",\\\"template\\\":[\\\"$\\\",\\\"$L22\\\",null,{},null,\\\"$37\\\",1],\\\"templateStyles\\\":\\\"$undefined\\\",\\\"templateScripts\\\":\\\"$undefined\\\",\\\"notFound\\\":\\\"$undefined\\\",\\\"forbidden\\\":\\\"$undefined\\\",\\\"unauthorized\\\":\\\"$undefined\\\",\\\"segmentViewBoundaries\\\":[\\\"$undefined\\\",\\\"$undefined\\\",\\\"$undefined\\\",\\\"$undefined\\\"]},null,\\\"$36\\\",1]]},null,\\\"$35\\\",0],{\\\"children\\\":[[\\\"$\\\",\\\"$c\\\",\\\"c\\\",{\\\"children\\\":[[\\\"$\\\",\\\"$La\\\",\\\"c-page\\\",{\\\"type\\\":\\\"page\\\",\\\"pagePath\\\":\\\"spaces/page.tsx\\\",\\\"children\\\":[\\\"$\\\",\\\"$L3b\\\",null,{\\\"Component\\\":\\\"$3c\\\",\\\"serverProvidedParams\\\":{\\\"searchParams\\\":{},\\\"params\\\":{},\\\"promises\\\":null}},null,\\\"$3a\\\",1]},null,\\\"$39\\\",1],[[\\\"$\\\",\\\"script\\\",\\\"script-0\\\",{\\\"src\\\":\\\"/_next/static/chunks/_1xdd44d._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$3d\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-1\\\",{\\\"src\\\":\\\"/_next/static/chunks/node_modules_1w47k1l._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$3e\\\",0],[\\\"$\\\",\\\"script\\\",\\\"script-2\\\",{\\\"src\\\":\\\"/_next/static/chunks/app_spaces_page_tsx_0-p-4mv._.js\\\",\\\"async\\\":true,\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$3f\\\",0]],\\\"$40\\\"]},null,\\\"$38\\\",0],{},null,false,null]},null,false,\\\"$@49\\\"]},null,false,null],[\\\"$\\\",\\\"$c\\\",\\\"h\\\",{\\\"children\\\":[\\\"$4b\\\",\\\"$50\\\",\\\"$59\\\",[\\\"$\\\",\\\"meta\\\",null,{\\\"name\\\":\\\"next-size-adjust\\\",\\\"content\\\":\\\"\\\"},null,\\\"$64\\\",1]]},null,\\\"$4a\\\",0],false]],\\\"m\\\":\\\"$W65\\\",\\\"G\\\":[\\\"$66\\\",[\\\"$\\\",\\\"$La\\\",\\\"ge-svn\\\",{\\\"type\\\":\\\"global-error\\\",\\\"pagePath\\\":\\\"__next_builtin__global-error.js\\\",\\\"children\\\":[[\\\"$\\\",\\\"link\\\",\\\"0\\\",{\\\"rel\\\":\\\"stylesheet\\\",\\\"href\\\":\\\"/_next/static/chunks/%5Broot-of-the-server%5D__0vhnoi5._.css\\\",\\\"precedence\\\":\\\"next_static/chunks/[root-of-the-server]__0vhnoi5._.css\\\",\\\"crossOrigin\\\":\\\"$undefined\\\",\\\"nonce\\\":\\\"$undefined\\\"},null,\\\"$68\\\",0]]},null,\\\"$67\\\",0]],\\\"S\\\":false,\\\"h\\\":null,\\\"s\\\":\\\"$undefined\\\",\\\"l\\\":\\\"$undefined\\\",\\\"p\\\":\\\"$undefined\\\",\\\"d\\\":\\\"$undefined\\\",\\\"b\\\":\\\"development\\\"}\\n\"])self.__next_f.push([1,\"69:[]\\n49:D\\\"$6a\\\"\\n49:\\\"$W69\\\"\\n56:D\\\"$6b\\\"\\n56:[[\\\"$\\\",\\\"meta\\\",\\\"0\\\",{\\\"charSet\\\":\\\"utf-8\\\"},\\\"$41\\\",\\\"$6c\\\",0],[\\\"$\\\",\\\"meta\\\",\\\"1\\\",{\\\"name\\\":\\\"viewport\\\",\\\"content\\\":\\\"width=device-width, initial-scale=1\\\"},\\\"$41\\\",\\\"$6d\\\",0]]\\n48:D\\\"$6e\\\"\\n48:null\\n61:D\\\"$6f\\\"\\n61:[[\\\"$\\\",\\\"title\\\",\\\"0\\\",{\\\"children\\\":\\\"Piramida Backstage\\\"},\\\"$41\\\",\\\"$70\\\",0],[\\\"$\\\",\\\"meta\\\",\\\"1\\\",{\\\"name\\\":\\\"description\\\",\\\"content\\\":\\\"Event space booking for the Pyramid of Tirana. Reserve spaces, generate quotes, and coordinate events at Albania's most iconic venue.\\\"},\\\"$41\\\",\\\"$71\\\",0],[\\\"$\\\",\\\"link\\\",\\\"2\\\",{\\\"rel\\\":\\\"icon\\\",\\\"href\\\":\\\"/favicon.ico?favicon.2vob68tjqpejf.ico\\\",\\\"sizes\\\":\\\"256x256\\\",\\\"type\\\":\\\"image/x-icon\\\"},\\\"$41\\\",\\\"$72\\\",0],[\\\"$\\\",\\\"$L74\\\",\\\"3\\\",{},\\\"$41\\\",\\\"$73\\\",0]]\\n\"])"
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "piramida backstage" [ref=e5] [cursor=pointer]:
          - /url: /
          - img [ref=e6]
          - generic [ref=e10]:
            - generic [ref=e11]: piramida
            - generic [ref=e12]: backstage
        - navigation [ref=e13]:
          - link "spaces" [ref=e14] [cursor=pointer]:
            - /url: /spaces
    - generic [ref=e15]:
      - navigation "breadcrumb" [ref=e17]:
        - link "Spaces" [ref=e18] [cursor=pointer]:
          - /url: /spaces
        - generic [ref=e19]: /
        - generic [ref=e20]: Ground Floor
        - generic [ref=e21]: /
        - generic [ref=e22]: Space A1
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic "available" [ref=e26]
          - generic [ref=e27]: available
          - generic [ref=e28]: ·
          - generic [ref=e29]: extension
        - link "← all spaces" [ref=e30] [cursor=pointer]:
          - /url: /spaces
    - generic [ref=e31]:
      - img "Space A1" [ref=e32]
      - paragraph [ref=e34]: A1
    - generic [ref=e35]:
      - generic [ref=e36]:
        - heading "Space A1" [level=1] [ref=e37]
        - paragraph [ref=e38]: Hapësira A1
        - generic [ref=e39]:
          - generic [ref=e40]:
            - paragraph [ref=e41]: 90pax
            - paragraph [ref=e42]: capacity
          - generic [ref=e43]:
            - paragraph [ref=e44]: 85m²
            - paragraph [ref=e45]: area
          - generic [ref=e46]:
            - paragraph [ref=e47]: 3.6m
            - paragraph [ref=e48]: ceiling
          - generic [ref=e49]:
            - paragraph [ref=e50]: €95/hr
            - paragraph [ref=e51]: rate
        - paragraph [ref=e52]: Premium modular space on the octagonal perimeter ring of the newly revitalized Pyramid of Tirana, ideal for workshops, tech events, and creative sessions. Natural concrete finishes and flexible layout options accommodate up to 90 guests in theater, roundtable, or standing configuration.
        - generic [ref=e53]:
          - paragraph [ref=e54]: included features
          - generic [ref=e55]:
            - generic [ref=e56]: projector
            - generic [ref=e57]: natural light
        - generic [ref=e58]:
          - paragraph [ref=e59]: available layouts
          - generic [ref=e60]:
            - generic [ref=e61]: roundtable
            - generic [ref=e62]: standing
            - generic [ref=e63]: flex
        - generic [ref=e64]:
          - paragraph [ref=e65]: specifications
          - table [ref=e66]:
            - rowgroup [ref=e67]:
              - row "space code A1" [ref=e68]:
                - cell "space code" [ref=e69]
                - cell "A1" [ref=e70]
              - row "floor Ground Floor" [ref=e71]:
                - cell "floor" [ref=e72]
                - cell "Ground Floor" [ref=e73]
              - row "category extension" [ref=e74]:
                - cell "category" [ref=e75]
                - cell "extension" [ref=e76]
              - row "area 85m²" [ref=e77]:
                - cell "area" [ref=e78]
                - cell "85m²" [ref=e79]
              - row "capacity 90pax" [ref=e80]:
                - cell "capacity" [ref=e81]
                - cell "90pax" [ref=e82]
              - row "ceiling height 3.6m" [ref=e83]:
                - cell "ceiling height" [ref=e84]
                - cell "3.6m" [ref=e85]
              - row "hourly rate €95+ VAT" [ref=e86]:
                - cell "hourly rate" [ref=e87]
                - cell "€95+ VAT" [ref=e88]
      - generic [ref=e90]:
        - paragraph [ref=e91]: request this space
        - generic [ref=e92]:
          - generic [ref=e93]:
            - generic [ref=e94]: date
            - textbox [ref=e95]
          - generic [ref=e96]:
            - generic [ref=e97]:
              - generic [ref=e98]: from
              - textbox [ref=e99]: 10:00
            - generic [ref=e100]:
              - generic [ref=e101]: until
              - textbox [ref=e102]: 14:00
          - generic [ref=e103]:
            - generic [ref=e104]: attendees (max 90)
            - spinbutton [ref=e105]: "50"
          - generic [ref=e106]:
            - generic [ref=e107]: your name
            - textbox "Full name" [ref=e108]
          - generic [ref=e109]:
            - generic [ref=e110]: email
            - textbox "you@example.com" [ref=e111]
          - generic [ref=e112]:
            - generic [ref=e113]:
              - paragraph [ref=e114]: estimated total (incl. 18% vat)
              - paragraph [ref=e115]: €448
            - paragraph [ref=e116]: 4h × €95/hr + VAT
          - button "request booking" [ref=e117] [cursor=pointer]
  - button "Open Piramida AI assistant" [ref=e119] [cursor=pointer]:
    - img [ref=e120]
    - generic [ref=e125]: ai
  - button "Open Next.js Dev Tools" [ref=e131] [cursor=pointer]:
    - img [ref=e132]
  - alert [ref=e135]
```

# Test source

```ts
  125 |     })
  126 |     console.log('\n📸 Saved: overlay-alignment.png  (ground floor — primary artifact)')
  127 | 
  128 |     // ── Per-floor screenshots for complete visual coverage ──
  129 |     // Ground floor already captured above; start from l3 onward
  130 |     for (const { key, label } of FLOORS) {
  131 |       await switchFloor(page, label)
  132 |       await page.screenshot({
  133 |         path: path.join(process.cwd(), `overlay-alignment-${key}.png`),
  134 |         fullPage: true,
  135 |       })
  136 |       console.log(`📸 Saved: overlay-alignment-${key}.png  (${label})`)
  137 |     }
  138 |   })
  139 | 
  140 |   // ── 2. ROUTING INTEGRITY ──────────────────────────────────────────────────
  141 |   test('2 · routing — every SVG button code returns HTTP 200', async ({ page }) => {
  142 |     await page.goto(`${BASE}/spaces`, { waitUntil: 'networkidle' })
  143 | 
  144 |     type Check = { code: string; floor: string; route: string; status: number }
  145 |     const checks: Check[] = []
  146 | 
  147 |     for (const { key, label } of FLOORS) {
  148 |       // Switch to the target floor (ground floor is already active on first iteration)
  149 |       if (key !== 'l0') {
  150 |         await switchFloor(page, label)
  151 |       } else {
  152 |         // Ground floor — wait for initial render
  153 |         await page
  154 |           .locator('svg g[role="button"]')
  155 |           .first()
  156 |           .waitFor({ state: 'visible', timeout: 15_000 })
  157 |       }
  158 | 
  159 |       const buttons = page.locator('svg g[role="button"]')
  160 |       const count = await buttons.count()
  161 | 
  162 |       for (let i = 0; i < count; i++) {
  163 |         const ariaLabel = (await buttons.nth(i).getAttribute('aria-label')) ?? ''
  164 |         const code = parseCode(ariaLabel, key)
  165 |         if (!code) continue
  166 | 
  167 |         const route = `/spaces/${code.toLowerCase()}`
  168 |         const res = await page.request.get(`${BASE}${route}`)
  169 |         const status = res.status()
  170 | 
  171 |         checks.push({ code, floor: key, route, status })
  172 | 
  173 |         expect
  174 |           .soft(status, `[${code} · ${key}] GET ${route} should return 200 (got ${status})`)
  175 |           .toBe(200)
  176 |       }
  177 |     }
  178 | 
  179 |     // Summary
  180 |     const failed = checks.filter(c => c.status !== 200)
  181 |     const passed = checks.filter(c => c.status === 200)
  182 | 
  183 |     console.log(
  184 |       `\n📊 Routing results: ${passed.length}/${checks.length} OK` +
  185 |       (failed.length ? ` — ❌ ${failed.length} broken:` : ' — ✅ no broken routes'),
  186 |     )
  187 |     failed.forEach(c => console.log(`   [${c.code}] ${c.route} → HTTP ${c.status}`))
  188 | 
  189 |     expect(checks.length, 'Must have found at least 1 interactive SVG element').toBeGreaterThan(0)
  190 |   })
  191 | 
  192 |   // ── 3. END-TO-END CLICK ────────────────────────────────────────────────────
  193 |   test('3 · e2e click — clicking the first ground-floor space navigates to its detail page', async ({ page }) => {
  194 |     await page.goto(`${BASE}/spaces`, { waitUntil: 'networkidle' })
  195 | 
  196 |     // Wait for ground floor SVG (default floor)
  197 |     await page
  198 |       .locator('svg g[role="button"]')
  199 |       .first()
  200 |       .waitFor({ state: 'visible', timeout: 15_000 })
  201 | 
  202 |     // Identify the first clickable space
  203 |     const firstBtn = page.locator('svg g[role="button"]').first()
  204 |     const ariaLabel = (await firstBtn.getAttribute('aria-label')) ?? ''
  205 |     const code = parseCode(ariaLabel, 'l0')
  206 |     const expectedPath = `/spaces/${code.toLowerCase()}`
  207 | 
  208 |     console.log(`\n🖱  Clicking: aria-label="${ariaLabel}"`)
  209 |     console.log(`   Expected navigation → ${expectedPath}`)
  210 | 
  211 |     // Click and wait for router.push() to fire
  212 |     await Promise.all([
  213 |       page.waitForURL(`**${expectedPath}`, { timeout: 12_000 }),
  214 |       firstBtn.click(),
  215 |     ])
  216 | 
  217 |     // Confirm we landed on the correct URL
  218 |     expect(page.url()).toContain(expectedPath)
  219 | 
  220 |     // The Server Component renders <h1> immediately — no loading spinner
  221 |     await expect(page.locator('h1').first()).toBeVisible({ timeout: 10_000 })
  222 | 
  223 |     // Assert the page content is NOT a 404 error page
  224 |     const bodyText = (await page.locator('body').textContent()) ?? ''
> 225 |     expect(bodyText).not.toMatch(/404|this page could not be found|page not found/i)
      |                          ^ Error: expect(received).not.toMatch(expected)
  226 | 
  227 |     console.log(`   ✅ Landed on ${page.url()} — <h1> visible, no 404 text`)
  228 |   })
  229 | })
  230 | 
```