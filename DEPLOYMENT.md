# Deployment Checklist

This document provides a step-by-step guide for deploying the application to production.

## Prerequisites

- GitHub account
- Vercel account (for frontend)
- Northflank account (for backend)
- Pinata account with JWT token

## Backend Deployment (Northflank)

1. **Create a Northflank account**
   - Sign up at [Northflank](https://northflank.com)
   - Create a new project

2. **Create a service**
   - Select your GitHub repository
   - Choose the main branch
   - Select Node.js as the runtime
   - Set the build command to `npm install`
   - Set the run command to `node server.js`
   - Set the port to 3000

3. **Configure environment variables**
   - Add `PINATA_JWT` with your Pinata JWT token
   - Add `NODE_ENV=production`
   - Add `FRONTEND_URL` pointing to your Vercel frontend URL (once you have it)
   - Optionally add `PINATA_GATEWAY` if you have a custom Pinata gateway

4. **Deploy**
   - Northflank will build and deploy your backend
   - The backend API will be available at your Northflank URL
   - Make note of this URL as you'll need it for the frontend configuration

## Frontend Deployment (Vercel)

1. **Create a Vercel account**
   - Sign up at [Vercel](https://vercel.com)
   - Connect your GitHub account

2. **Import your repository**
   - Select your repository
   - Vercel will automatically detect the Vite configuration

3. **Configure environment variables**
   - Add `VITE_API_URL` pointing to your Northflank backend URL
   - For example: `VITE_API_URL=https://p01--signature--sqrfq849w2vt.code.run`
   - Make sure to include the `https://` prefix

4. **Deploy**
   - Vercel will build and deploy your frontend
   - The frontend will be available at your Vercel URL

## Post-Deployment

1. **Update CORS configuration**
   - Go back to your Northflank service
   - Update the `FRONTEND_URL` environment variable to match your Vercel URL
   - Redeploy the backend service

2. **Test the application**
   - Open your Vercel URL in a browser
   - Test the drawing functionality
   - Test the wallet connection
   - Test the minting process

3. **Monitor for errors**
   - Check the Vercel logs for frontend errors
   - Check the Northflank logs for backend errors

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure the `FRONTEND_URL` in your backend matches your Vercel URL
   - Check that your frontend is using the correct `VITE_API_URL`

2. **Pinata JWT Errors**
   - Verify that your Pinata JWT token is valid and has not expired
   - Check that it has the necessary permissions for pinning files

3. **Wallet Connection Issues**
   - Make sure your wallet is connected to the Base network
   - Check for console errors related to wallet connection

4. **Minting Errors**
   - Verify that your wallet has enough ETH for gas fees
   - Check the console for detailed error messages

## Updating the Deployment

### Backend Updates

1. Push changes to your GitHub repository
2. Northflank will automatically rebuild and deploy the backend

### Frontend Updates

1. Push changes to your GitHub repository
2. Vercel will automatically rebuild and deploy the frontend

## Rollback

### Vercel Rollback

1. Go to your project on Vercel
2. Navigate to the Deployments tab
3. Find the previous working deployment
4. Click the three dots and select "Promote to Production"

### Northflank Rollback

1. Go to your service on Northflank
2. Navigate to the Deployments tab
3. Find the previous working deployment
4. Click "Rollback" to revert to that version
