import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: AuthInput!) {
    register(input: $input) {
      accessToken
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: AuthInput!) {
    login(input: $input) {
      accessToken
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      email
    }
  }
`;

export const MY_URLS = gql`
  query MyUrls {
    myUrls {
      slug
      originalUrl
      clickCount
      createdAt
    }
  }
`;

export const CREATE_URL = gql`
  mutation CreateUrl($input: CreateUrlInput!) {
    createUrl(input: $input) {
      slug
      originalUrl
      clickCount
    }
  }
`;

export const URL_STATS = gql`
  query UrlStats($slug: String!) {
    urlStats(slug: $slug) {
      slug
      shortUrl
      totalClicks
      recentClicks {
        ipAddress
        userAgent
        clickedAt
      }
    }
  }
`;
