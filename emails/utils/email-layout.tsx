import { SITE_CONFIG, WEBSITE_URL } from "@/lib/site-config";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";
import type { PropsWithChildren } from "react";

export const EmailLayout = (
  props: PropsWithChildren<{ disableTailwind?: boolean }>
) => {
  let baseUrl = WEBSITE_URL;

  if (baseUrl.startsWith("http://localhost")) {
    baseUrl = SITE_CONFIG.SERVER.PROD_URL;
  }

  return (
    <Html>
      <Head />
      <Body
        style={{
          backgroundColor: "#ffffff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        <Container style={{ margin: "0 auto", padding: "1.5rem" }}>
          <Tailwind>
            <table cellPadding={0} cellSpacing={0}>
              <tr>
                <td className="pr-2">
                  <Img
                    src={`${baseUrl}${SITE_CONFIG.SEO.ICON}`}
                    width={32}
                    height={32}
                    alt={`${SITE_CONFIG.SEO.TITLE} logo`}
                  />
                </td>
                <td>
                  <Text className="text-xl font-bold">
                    {SITE_CONFIG.SEO.TITLE}
                  </Text>
                </td>
              </tr>
            </table>
          </Tailwind>
          {props.disableTailwind ? (
            props.children
          ) : (
            <Tailwind>{props.children}</Tailwind>
          )}
          <Tailwind>
            <Hr className="mt-12 mb-6 border-gray-300" />
            <table cellPadding={0} cellSpacing={0}>
              <tr>
                <td className="pr-2">
                  <Img
                    src={`${baseUrl}${SITE_CONFIG.SEO.ICON}`}
                    width={32}
                    height={32}
                    alt={`${SITE_CONFIG.SEO.TITLE} logo`}
                  />
                </td>
                <td>
                  <Text className="text-xl">{SITE_CONFIG.SEO.TITLE}</Text>
                </td>
              </tr>
            </table>
            <Text className="text-sm text-gray-500">
              {SITE_CONFIG.MAKER.ADDRESS}
            </Text>
          </Tailwind>
        </Container>
      </Body>
    </Html>
  );
};
