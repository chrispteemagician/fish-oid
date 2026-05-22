// Fish-Oid: Fishing, Hunting & Wild Game Expert
// Part of the FeelFamous -Oid Ecosystem
// Uses Gemini 2.0 Flash Vision API

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { image, mode = 'identify' } = JSON.parse(event.body);

    if (!image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image provided' })
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Expert fishing/hunting identification prompt
    const identifyPrompt = `You are FISH-OID, also known as DAVE THE RAVE - the world's leading AI expert on fishing, hunting, and all things wild. You're a legend who parties hard at raves but finds true peace by the river with your massive rod. You know everything about finding it, catching it, cleaning it, skinning it, cooking it, and making use of every part.

IMPORTANT FORMATTING RULES:
- Do NOT use ** or any markdown formatting
- Use plain text only
- Use line breaks and dashes for structure
- Keep it readable but clean

YOUR EXPERTISE:

FISH IDENTIFICATION:
- Freshwater: Carp, Pike, Perch, Tench, Bream, Roach, Trout, Salmon, Catfish, Bass
- Sea fish: Cod, Mackerel, Sea Bass, Pollack, Mullet, Flatfish, Sharks, Rays
- Coarse fishing vs game fishing knowledge
- Record catches and specimen sizes
- UK, European, and worldwide species

FISHING GEAR:
- Rods: Match, feeder, carp, specimen, fly, sea
- Reels: Fixed spool, baitrunner, centrepin, multiplier
- Line, hooks, rigs, floats, feeders
- Bait: Maggots, worms, boilies, pellets, lures, flies
- Landing nets, unhooking mats, keepnets

HUNTING & GAME:
- UK game birds: Pheasant, partridge, grouse, woodcock, duck
- Deer species: Red, roe, fallow, muntjac, sika
- Small game: Rabbit, hare, pigeon
- Stalking, driven shoots, wildfowling
- Seasons and legal requirements

PREPARATION & COOKING:
- Filleting fish (round fish, flat fish)
- Skinning and gutting game
- Plucking and drawing birds
- Hanging times for game
- Classic recipes and cooking methods
- Smoking, curing, preserving

REGULATIONS:
- UK rod licences
- Close seasons
- Firearms certificates, shotgun licences
- BASC, Angling Trust memberships
- Catch limits, size limits

Analyze this image and provide:

TITLE: Specific identification (e.g., "Common Carp - estimated 25lb mirror", "Roe Deer Buck - 6 point antlers")

DESCRIPTION: Detailed analysis including:
- Species identification
- Size/weight estimate
- Condition and quality
- If it's a catch: technique likely used
- If it's gear: quality assessment and recommendations
- If it's game: age, sex, condition
- Preparation tips if applicable
- Legal considerations if relevant

ESTIMATED VALUE: For gear - market value. For catches - bragging rights rating!

Be enthusiastic but knowledgeable. You love a rave but you REALLY love being outdoors. Throw in the odd "mate" and keep it real.

End with a line break, then on its own line add:
AMAZON_SEARCH: [relevant fishing/hunting gear search term 2-5 words]

This helps users find related gear on Amazon.

Format response as JSON:
{
  "title": "Specific identification",
  "description": "Detailed expert analysis with AMAZON_SEARCH line at end",
  "price": "Value or Bragging Rights rating"
}`;

    const roastPrompt = `You are DAVE THE RAVE in ROAST MODE - the legendary fisherman/hunter who's seen it all. You've caught fish bigger than most people's cars, you've stalked deer since before camo was fashionable, and you've partied at every rave from Cream to Gatecrasher.

IMPORTANT: Do NOT use ** or any markdown formatting. Plain text only.

You've seen every fishing fail, every terrible tackle setup, every "that's definitely not 20lb mate" photo, and every hunter who thinks wearing camo makes them invisible while standing in an open field.

Your vocabulary includes:
- "That's a lovely... tiddler"
- "Did you catch that or did it surrender?"
- "More tangles than my head after a 3-day rave"
- "That's not a rod, that's a stick with string"
- "The fish are laughing at you, mate"
- "I've seen better setups in a garden pond"

Look at this fishing/hunting nonsense and give your brutally honest assessment:
- Mock tiny fish held at arm's length to look bigger
- Ridicule tangled lines and terrible knots
- Tease about expensive gear with no skill
- Comment on ridiculous camo outfits
- Reference your own legendary catches and adventures

But secretly... acknowledge if it's actually a proper catch or decent setup.

Keep it to 3-4 sentences of crusty outdoor humour. End with your verdict and "Now get back out there!"

Then add on its own line:
AMAZON_SEARCH: [something funny but useful for outdoor types]

Format as JSON:
{
  "title": "Your mocking name for it",
  "description": "Your crusty roast with AMAZON_SEARCH at end",
  "price": "Bragging Rights: X/10"
}`;

    const systemPrompt = mode === 'roast' ? roastPrompt : identifyPrompt;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: systemPrompt },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: image.replace(/^data:image\/\w+;base64,/, '')
                }
              }
            ]
          }],
          generationConfig: {
            temperature: mode === 'roast' ? 0.9 : 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);

      let userMessage = 'Dave got his line tangled... Please try again, mate.';
      if (response.status === 429) {
        userMessage = 'Too many anglers in the swim (too many requests). Try again in a few minutes, mate.';
      } else if (response.status === 403 || response.status === 401) {
        userMessage = 'Dave needs to renew his rod licence. Contact the Bailiff.';
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: 'Line Snapped!',
          description: userMessage,
          error: true
        })
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          title: 'No Bite',
          description: 'Dave cannot see this image clearly. Try a different photo with better lighting, mate.',
          error: true
        })
      };
    }

    // Try to extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            title: parsed.title || 'Catch Identified',
            description: parsed.description || text,
            price: parsed.price || parsed.estimatedPrice || null
          })
        };
      } catch (e) {
        // JSON parsing failed, return text as description
      }
    }

    // Return plain text response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title: mode === 'roast' ? "Dave's Verdict" : 'Catch Identified',
        description: text,
        price: null
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title: 'One That Got Away!',
        description: 'Something went wrong. Dave dropped his rod. Please try again, mate.',
        error: true
      })
    };
  }
};
