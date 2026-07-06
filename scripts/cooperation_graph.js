// cooperation_graph.js

(function() {
  const TARGET_ORCID = "0000-0001-7561-3619"; 
  const PRIMARY_AUTHOR_NAME = "Diego Camarmas Alonso";

  const modal = document.getElementById('cooperation-modal');
  const openBtn = document.getElementById('open-cooperation-modal');
  const closeBtn = document.getElementById('close-cooperation-modal');
  let graphInitialized = false; 
  let cachedMatrixData = null; 

  function formatAuthorName(str) {
    if (!str) return "";
    let cleanStr = str.trim().replace(/\s+[a-zA-Z]\b\.?/g, '');
    cleanStr = cleanStr.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
    cleanStr = cleanStr.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return cleanStr.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  async function fetchGraphData() {
    try {
      const response = await fetch(`https://api.openalex.org/works?filter=author.orcid:${TARGET_ORCID}`);
      const data = await response.json();
      
      const coauthorsCounter = {};
      const papersAuthorsList = [];

      if (!data.results || data.results.length === 0) {
        console.warn("OpenAlex API returned no results for this ORCID. Using simulation dataset.");
        return getMockData();
      }

      data.results.forEach(article => {
        const authorsInPaper = [];
        article.authorships.forEach(authorship => {
          const author = authorship.author;
          const formattedName = formatAuthorName(author.display_name);
          const isPrimaryAuthor = author.orcid && author.orcid.includes(TARGET_ORCID);
          const finalName = isPrimaryAuthor ? PRIMARY_AUTHOR_NAME : formattedName;
          
          authorsInPaper.push(finalName);
          if (!isPrimaryAuthor && formattedName) {
            coauthorsCounter[formattedName] = (coauthorsCounter[formattedName] || 0) + 1;
          }
        });
        papersAuthorsList.push(authorsInPaper);
      });

      const mainCoauthors = Object.keys(coauthorsCounter).filter(name => coauthorsCounter[name] >= 1);
      const allAuthors = [PRIMARY_AUTHOR_NAME, ...mainCoauthors];
      const N = allAuthors.length;

      if (N <= 1) return getMockData();

      const matrix = Array.from({ length: N }, () => Array(N).fill(0));
      papersAuthorsList.forEach(authorsInPaper => {
        authorsInPaper.forEach(authorA => {
          authorsInPaper.forEach(authorB => {
            if (authorA !== authorB) {
              const idxA = allAuthors.indexOf(authorA);
              const idxB = allAuthors.indexOf(authorB);
              if (idxA !== -1 && idxB !== -1) matrix[idxA][idxB]++;
            }
          });
        });
      });

      return { matrix, allAuthors, N };

    } catch (error) {
      console.error("API Error, loading fallback dataset:", error);
      return getMockData();
    }
  }

  function getMockData() {
    const allAuthors = [PRIMARY_AUTHOR_NAME, "Smith J", "Gomez M", "Dupont A", "Müller K"];
    const matrix = [
      [0, 5, 3, 2, 4],
      [5, 0, 1, 0, 1],
      [3, 1, 0, 2, 0],
      [2, 0, 2, 0, 0],
      [4, 1, 0, 0, 0]
    ];
    return { matrix, allAuthors, N: allAuthors.length };
  }

  function renderChordLayout(dataBundle) {
    if (!dataBundle) return;
    const { matrix, allAuthors, N } = dataBundle;
    
    const container = document.getElementById('modal-canvas-container');
    d3.select("#modal-canvas-container").selectAll("svg").remove();

    let width = container.clientWidth;
    let height = container.clientHeight;
    
    if (width === 0 || height === 0) {
      width = window.innerWidth;
      height = window.innerHeight - 65;
    }

    const baseSvg = d3.select("#modal-canvas-container")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("display", "block")
      .style("width", "100%")
      .style("height", "100%");

    const mainGroup = baseSvg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const outerRadius = Math.min(width, height) * 0.5 - 185; 
    const innerRadius = Math.max(10, outerRadius - 20); 

    const chord = d3.chord().sortSubgroups(d3.descending).sortChords(d3.descending);
    const chords = chord(matrix);
    
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    const ribbon = d3.ribbon().radius(innerRadius - 1);
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(N));

    // Outer Arcs
    const group = mainGroup.append("g").selectAll("g").data(chords.groups).join("g");
    group.append("path")
      .attr("fill", d => color(d.index))
      .attr("d", arc)
      .style("cursor", "pointer")
      .style("stroke", "#fff")
      .append("title")
      .text(d => `${allAuthors[d.index]} (${d.value} total collaborations)`);

    // Ribbons
    const ribbons = mainGroup.append("g")
      .attr("fill-opacity", 0.6)
      .selectAll("path")
      .data(chords)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", d => color(d.source.index))
      .style("mix-blend-mode", "multiply")
      .style("stroke", "none");

    ribbons.append("title")
      .text(d => `Link: ${allAuthors[d.source.index]} ⬌ ${allAuthors[d.target.index]} (${d.source.value} shared paper(s))`);

    // Labels
    group.append("text")
      .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
      .attr("dy", ".35em")
      .style("font-family", "sans-serif")
      .style("font-size", "12px") 
      .style("fill", "#2c3e50")
      .style("font-weight", "600") 
      .style("pointer-events", "none")
      .attr("transform", d => `
        rotate(${(d.angle * 180 / Math.PI - 90)})
        translate(${outerRadius + 12})
        ${d.angle > Math.PI ? "rotate(180)" : ""}
      `)
      .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
      .text(d => allAuthors[d.index]);

    // Interaction
    group.on("mouseover", function(event, d) {
      ribbons.filter(c => c.source.index !== d.index && c.target.index !== d.index)
        .transition().duration(100).style("opacity", 0.03);
    }).on("mouseout", function() {
      ribbons.transition().duration(100).style("opacity", 1);
    });
  }

  async function openModal() {
    modal.classList.add('is-active'); 

    await new Promise(resolve => setTimeout(resolve, 300));

    if (!graphInitialized) {
      cachedMatrixData = await fetchGraphData();
      if(cachedMatrixData) graphInitialized = true;
    }

    if(graphInitialized) {
      renderChordLayout(cachedMatrixData); 
    }
  }

  function closeModal() {
    modal.classList.remove('is-active');
  }

  if (openBtn && closeBtn && modal) {
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if(e.target === modal) closeModal(); }); 
    window.addEventListener("resize", () => { if(modal.classList.contains('is-active')) renderChordLayout(cachedMatrixData); });
  }
})();